const Booking = require("../models/Booking");
const Show = require("../models/Show");
const Movie = require("../models/Movie");
const User = require("../models/User");
const { sendBookingConfirmationEmail } = require("../utils/emailService");

// @POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { showId, itemId, seats, foodItems, stripePaymentIntentId, useCoins } = req.body;
    
    let totalAmount = 0;
    let foodTotal = 0;
    let convenienceFee = 0;
    let gst = 0;
    let grandTotal = 0;
    let coinsUsed = 0;
    let coinsEarned = 0;
    const seatList = [];

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (showId) {
      // It's a Movie or Event tied to a show
      const show = await Show.findById(showId);
      if (!show) return res.status(404).json({ success: false, message: "Show not found" });

      for (const seat of seats) {
        const { type, seatNumber } = seat;
        if (!show.seats[type]) return res.status(400).json({ success: false, message: `Invalid seat type: ${type}` });
        if (show.seats[type].bookedSeats.includes(seatNumber))
          return res.status(400).json({ success: false, message: `Seat ${seatNumber} is already booked` });
        totalAmount += show.seats[type].price;
        seatList.push({ type, seatNumber });
      }

      if (foodItems && foodItems.length > 0) {
        foodItems.forEach(item => {
          foodTotal += item.price * item.quantity;
        });
      }

      totalAmount += foodTotal;

      convenienceFee = Math.round(totalAmount * 0.05);
      gst = Math.round(totalAmount * 0.18);
      grandTotal = totalAmount + convenienceFee + gst;

      if (useCoins && user.cineCoins > 0) {
        if (user.cineCoins >= grandTotal) {
          coinsUsed = grandTotal;
          grandTotal = 0;
        } else {
          coinsUsed = user.cineCoins;
          grandTotal -= coinsUsed;
        }
      }

      // If grandTotal is 0, we can auto-confirm
      const isConfirmed = stripePaymentIntentId || grandTotal === 0;

      coinsEarned = isConfirmed ? Math.round(grandTotal * 0.05) : 0;

      // Lock seats in show
      for (const seat of seatList) {
        show.seats[seat.type].bookedSeats.push(seat.seatNumber);
      }
      await show.save();

      // Broadcast seatsBooked event via WebSockets
      const io = req.app.get("socketio");
      if (io) {
        io.to(showId.toString()).emit("seatsBooked", { seats: seatList });
      }

      if (isConfirmed) {
        user.cineCoins = user.cineCoins - coinsUsed + coinsEarned;
        await user.save();
      }

      const booking = await Booking.create({
        user: req.user._id,
        item: show.movie,
        show: showId,
        seats: seatList,
        foodItems: foodItems || [],
        totalAmount,
        convenienceFee,
        gst,
        grandTotal,
        coinsEarned,
        coinsUsed,
        stripePaymentIntentId: stripePaymentIntentId || "",
        stripeStatus: isConfirmed ? "succeeded" : "pending",
        status: isConfirmed ? "confirmed" : "pending",
      });

      const populated = await Booking.findById(booking._id)
        .populate({ path: "show", populate: [{ path: "movie" }, { path: "theatre" }] })
        .populate("user", "name email");

      if (populated.status === "confirmed") {
        await sendBookingConfirmationEmail(populated.user.email, populated.user.name, {
          isPremiere: false,
          bookingId: populated.bookingId,
          poster: populated.show.movie.poster,
          title: populated.show.movie.title,
          theatre: populated.show.theatre.name + " - " + populated.show.theatre.location,
          date: new Date(populated.show.date).toLocaleDateString(),
          time: populated.show.time,
          seats: seatList.map(s => s.seatNumber).join(", "),
          amount: grandTotal,
        }).catch(err => console.log("Booking email error:", err));
      }

      return res.status(201).json({ success: true, message: "Booking confirmed!", data: populated });
    } else if (itemId) {
      // It's a Premiere or Event
      const item = await Movie.findById(itemId);
      if (!item) return res.status(404).json({ success: false, message: "Item not found" });

      if (item.itemType === "event") {
        totalAmount = req.body.totalAmount || item.basePrice || 0;
      } else {
        totalAmount = item.basePrice || 0;
      }
      convenienceFee = Math.round(totalAmount * 0.05);
      gst = Math.round(totalAmount * 0.18);
      grandTotal = totalAmount + convenienceFee + gst;

      if (useCoins && user.cineCoins > 0) {
        if (user.cineCoins >= grandTotal) {
          coinsUsed = grandTotal;
          grandTotal = 0;
        } else {
          coinsUsed = user.cineCoins;
          grandTotal -= coinsUsed;
        }
      }

      const isConfirmed = stripePaymentIntentId || grandTotal === 0;
      coinsEarned = isConfirmed ? Math.round(grandTotal * 0.05) : 0;

      if (isConfirmed) {
        user.cineCoins = user.cineCoins - coinsUsed + coinsEarned;
        await user.save();
      }

      const booking = await Booking.create({
        user: req.user._id,
        item: itemId,
        seats: seats || [], // events have seats
        totalAmount,
        convenienceFee,
        gst,
        grandTotal,
        coinsEarned,
        coinsUsed,
        stripePaymentIntentId: stripePaymentIntentId || "",
        stripeStatus: isConfirmed ? "succeeded" : "pending",
        status: isConfirmed ? "confirmed" : "pending",
      });

      const populated = await Booking.findById(booking._id)
        .populate("item")
        .populate("user", "name email");

      if (populated.status === "confirmed") {
        await sendBookingConfirmationEmail(populated.user.email, populated.user.name, {
          isPremiere: true,
          bookingId: populated.bookingId,
          poster: populated.item.poster,
          title: populated.item.title,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          amount: grandTotal,
        }).catch(err => console.log("Premiere email error:", err));
      }

      return res.status(201).json({ success: true, message: "Rent/Buy confirmed!", data: populated });
    } else {
      return res.status(400).json({ success: false, message: "showId or itemId is required" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/bookings/my
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: "show", populate: [{ path: "movie", select: "title poster backdrop" }, { path: "theatre", select: "name location" }] })
      .populate("item", "title poster backdrop itemType")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: "show", populate: [{ path: "movie" }, { path: "theatre" }] })
      .populate("item")
      .populate("user", "name email phone");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized" });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("show");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized" });
    if (booking.status === "cancelled")
      return res.status(400).json({ success: false, message: "Booking already cancelled" });

    // Release seats
    if (booking.show && booking.seats && booking.seats.length > 0) {
      const show = await Show.findById(booking.show._id);
      for (const seat of booking.seats) {
        if (show.seats && show.seats[seat.type]) {
           show.seats[seat.type].bookedSeats = show.seats[seat.type].bookedSeats.filter((s) => s !== seat.seatNumber);
        }
      }
      await show.save();

      // Broadcast seatsReleased event via WebSockets
      const io = req.app.get("socketio");
      if (io) {
        io.to(booking.show._id.toString()).emit("seatsReleased", { seats: booking.seats });
      }
    }

    // Trigger Stripe Refund if stripePaymentIntentId is present
    if (booking.stripePaymentIntentId) {
      try {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
        });
      } catch (stripeError) {
        console.error("Stripe refund failed or already processed:", stripeError.message);
        return res.status(500).json({ 
          success: false, 
          message: `Stripe refund failed: ${stripeError.message}` 
        });
      }
    }

    // Refund loyalty CineCoins balance to the user and deduct earned coins
    const User = require("../models/User");
    const user = await User.findById(booking.user);
    if (user) {
      user.cineCoins = user.cineCoins + (booking.coinsUsed || 0) - (booking.coinsEarned || 0);
      if (user.cineCoins < 0) user.cineCoins = 0;
      await user.save();
    }

    booking.status = "cancelled";
    booking.stripeStatus = "refunded";
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({ success: true, message: "Booking cancelled", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/admin/bookings
const getAllBookings = async (req, res) => {
  try {
    const { status, movieId } = req.query;
    let filter = {};
    if (status) filter.status = status;

    let bookings = await Booking.find(filter)
      .populate({ path: "show", populate: [{ path: "movie", select: "title poster" }, { path: "theatre", select: "name location" }] })
      .populate("item", "title poster itemType")
      .populate("user", "name email phone avatar")
      .sort({ createdAt: -1 });

    if (movieId) {
      bookings = bookings.filter((b) => (b.show?.movie?._id?.toString() === movieId) || (b.item?._id?.toString() === movieId));
    }

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, getUserBookings, getBookingById, cancelBooking, getAllBookings };
