const Show = require("../models/Show");

// @GET /api/shows/movie/:movieId
const getShowsByMovie = async (req, res) => {
  try {
    const { date, location } = req.query;
    let filter = { movie: req.params.movieId, isActive: true };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const shows = await Show.find(filter)
      .populate("movie", "title poster rating duration")
      .populate("theatre", "name location address")
      .sort({ date: 1, time: 1 });

    // Group by theatre
    const theatreMap = {};
    shows.forEach((show) => {
      if (!show.theatre) return;
      
      // If a location query parameter was provided, only include shows whose theatre location matches
      if (location && show.theatre.location?.trim().toLowerCase() !== location.trim().toLowerCase()) {
        return;
      }

      const tId = show.theatre._id.toString();
      if (!theatreMap[tId]) {
        theatreMap[tId] = { theatre: show.theatre, shows: [] };
      }
      theatreMap[tId].shows.push(show);
    });

    res.json({ success: true, data: Object.values(theatreMap) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/shows/:id
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movie", "title poster rating duration language")
      .populate("theatre", "name location address phone");
    if (!show) return res.status(404).json({ success: false, message: "Show not found" });
    res.json({ success: true, data: show });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/shows (admin)
const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ isActive: true })
      .populate({ path: "movie", match: { isActive: true }, select: "title poster duration" })
      .populate({ path: "theatre", match: { isActive: true }, select: "name location address" })
      .sort({ date: -1 });

    const validShows = shows.filter(s => s.movie && s.theatre);
    res.json({ success: true, data: validShows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/shows (admin)
const createShow = async (req, res) => {
  try {
    const { movie, theatre, screen, date, time, format, language, goldPrice, platinumPrice, reclinerPrice } = req.body;

    const show = await Show.create({
      movie,
      theatre,
      screen,
      date,
      time,
      format,
      language,
      seats: {
        gold: { price: goldPrice, total: 40, rows: 4, seatsPerRow: 10, bookedSeats: [] },
        platinum: { price: platinumPrice, total: 30, rows: 3, seatsPerRow: 10, bookedSeats: [] },
        recliner: { price: reclinerPrice, total: 20, rows: 2, seatsPerRow: 10, bookedSeats: [] },
      },
    });

    const populated = await show.populate(["movie", "theatre"]);
    res.status(201).json({ success: true, message: "Show created", data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/shows/:id (admin)
const updateShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!show) return res.status(404).json({ success: false, message: "Show not found" });
    res.json({ success: true, message: "Show updated", data: show });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/shows/:id (admin)
const deleteShow = async (req, res) => {
  try {
    await Show.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Show deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getShowsByMovie, getShowById, getAllShows, createShow, updateShow, deleteShow };
