const Booking = require("../models/Booking");
const User = require("../models/User");
const Movie = require("../models/Movie");
const Show = require("../models/Show");

exports.getAnalytics = async (req, res) => {
  try {
    // Basic KPIs
    const totalBookings = await Booking.countDocuments({ status: "confirmed" });
    const totalUsers = await User.countDocuments();
    
    // Revenue & Tickets via aggregation
    const revenueStats = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$grandTotal" },
          totalTickets: { $sum: { $size: { $ifNull: ["$seats", []] } } }
        }
      }
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    const totalTickets = revenueStats.length > 0 ? revenueStats[0].totalTickets : 0;

    // Daily Revenue (Last 7 Days) for Line Chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Booking.aggregate([
      { $match: { status: "confirmed", createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$grandTotal" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Popular Genres (Pie Chart)
    const genreStats = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $lookup: {
          from: "shows",
          localField: "show",
          foreignField: "_id",
          as: "showData"
        }
      },
      { $unwind: { path: "$showData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "movies",
          localField: "showData.movie",
          foreignField: "_id",
          as: "movieData"
        }
      },
      { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          genres: { $ifNull: ["$movieData.genre", []] },
          tickets: { $size: { $ifNull: ["$seats", []] } }
        }
      },
      { $unwind: "$genres" },
      {
        $group: {
          _id: "$genres",
          value: { $sum: "$tickets" }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);

    const formattedGenres = genreStats.map(g => ({ name: g._id, value: g.value }));

    // Popular Movies (Bar Chart)
    const movieStats = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $lookup: {
          from: "shows",
          localField: "show",
          foreignField: "_id",
          as: "showData"
        }
      },
      { $unwind: { path: "$showData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "movies",
          localField: "showData.movie",
          foreignField: "_id",
          as: "movieData"
        }
      },
      { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$movieData.title",
          revenue: { $sum: "$grandTotal" }
        }
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    const formattedMovies = movieStats.map(m => ({ name: m._id, revenue: m.revenue }));

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalRevenue,
          totalTickets,
          totalBookings,
          totalUsers
        },
        dailyRevenue,
        popularGenres: formattedGenres,
        popularMovies: formattedMovies
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ status: "confirmed" });
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments({ isActive: true });
    const totalTheatres = await require("../models/Theatre").countDocuments({ isActive: true });
    const totalShows = await Show.countDocuments({ isActive: true });

    // Sum of grandTotal for confirmed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$grandTotal" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        totalUsers,
        totalMovies,
        totalTheatres,
        totalShows,
        totalRevenue
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getRevenueByMonth = async (req, res) => {
  try {
    const revenueByMonth = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$grandTotal" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = revenueByMonth.map(item => {
      const monthIndex = item._id.month - 1;
      return {
        month: `${months[monthIndex]} ${item._id.year}`,
        revenue: item.revenue
      };
    });

    res.status(200).json({ success: true, data: formattedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user", "name email");
    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyTicket = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate("item", "title itemType")
      .populate({
        path: "show",
        populate: { path: "movie", select: "title" }
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ success: false, message: `Ticket is not valid. Status: ${booking.status}` });
    }

    if (booking.isScanned) {
      return res.status(400).json({ success: false, message: "Ticket has already been scanned!", alreadyScanned: true });
    }

    // Mark as scanned
    booking.isScanned = true;
    await booking.save();

    const title = booking.show?.movie?.title || booking.item?.title || "Unknown Show";

    res.status(200).json({
      success: true,
      message: "Ticket Verified Successfully! Admit guest.",
      data: {
        bookingId: booking._id,
        user: booking.user.name,
        title,
        seats: booking.seats.map(s => s.seatNumber),
        foodItems: booking.foodItems
      }
    });
  } catch (err) {
    console.error("QR Scan Error:", err);
    res.status(500).json({ success: false, message: "Invalid QR Code or Server Error" });
  }
};
