const Movie = require("../models/Movie");
const Show = require("../models/Show");
const asyncHandler = require("express-async-handler");

const filterMoviesByLocation = async (baseFilter, location) => {
  if (!location) {
    return await Movie.find(baseFilter).sort({ createdAt: -1 });
  }

  const shows = await Show.find({ isActive: true })
    .populate({
      path: "theatre",
      match: { location: { $regex: new RegExp(`^${location}$`, "i") } },
      select: "_id location"
    })
    .select("movie theatre");

  const validShows = shows.filter((s) => s.theatre !== null);
  const validMovieIds = [...new Set(validShows.map((s) => s.movie.toString()))];

  return await Movie.find({ ...baseFilter, _id: { $in: validMovieIds } }).sort({ createdAt: -1 });
};

// @GET /api/movies
const getAllMovies = asyncHandler(async (req, res) => {
  const { genre, language, search, itemType, location } = req.query;
  let filter = { isActive: true };
  if (genre) filter.genre = { $in: [genre] };
  if (language) filter.language = language;
  if (search) filter.title = { $regex: search, $options: "i" };
  if (itemType) filter.itemType = itemType;

  let movies;
  if (location && itemType !== 'premiere') {
    movies = await filterMoviesByLocation(filter, location);
  } else {
    movies = await Movie.find(filter).sort({ createdAt: -1 });
  }

  res.json({ success: true, data: movies });
});

// @GET /api/movies/now-showing
const getNowShowing = asyncHandler(async (req, res) => {
  const { location } = req.query;
  const movies = await filterMoviesByLocation({ isNowShowing: true, isActive: true, itemType: "movie" }, location);
  res.json({ success: true, data: movies });
});

// @GET /api/movies/upcoming
const getUpcoming = asyncHandler(async (req, res) => {
  const movies = await Movie.find({ isUpcoming: true, isActive: true, itemType: "movie" }).sort({ releaseDate: 1 });
  res.json({ success: true, data: movies });
});

// @GET /api/movies/premieres
const getPremieres = asyncHandler(async (req, res) => {
  const movies = await Movie.find({ itemType: "premiere", isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: movies });
});

// @GET /api/movies/events
const getEvents = asyncHandler(async (req, res) => {
  const { location } = req.query;
  let filter = { itemType: "event", isActive: true };
  if (location) {
    filter.eventLocation = { $regex: location, $options: "i" };
  }
  let events = await Movie.find(filter).sort({ createdAt: -1 });
  
  if (events.length === 0 && location) {
    events = await Movie.find({ itemType: "event", isActive: true }).sort({ createdAt: -1 });
  }

  res.json({ success: true, data: events });
});

// @GET /api/movies/:id
const getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    res.status(404);
    throw new Error("Movie not found");
  }
  res.json({ success: true, data: movie });
});

// @POST /api/movies (admin)
const createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({ success: true, message: "Movie created", data: movie });
});

// @PUT /api/movies/:id (admin)
const updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!movie) {
    res.status(404);
    throw new Error("Movie not found");
  }
  res.json({ success: true, message: "Movie updated", data: movie });
});

// @DELETE /api/movies/:id (admin)
const deleteMovie = asyncHandler(async (req, res) => {
  await Movie.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: "Movie deleted" });
});
// @GET /api/movies/:id/recommendations
const getMovieRecommendations = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    res.status(404);
    throw new Error("Movie not found");
  }

  // Find movies with matching genre OR language, excluding the current one
  const recommendations = await Movie.find({
    _id: { $ne: movie._id },
    isActive: true,
    $or: [
      { genre: { $in: movie.genre } },
      { language: { $in: movie.language } }
    ]
  }).limit(5).sort({ createdAt: -1 });

  res.json({ success: true, data: recommendations });
});

// @PUT /api/movies/:id/interest
const toggleMovieInterest = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    res.status(404);
    throw new Error("Movie not found");
  }

  const userId = req.user._id;
  const isInterested = movie.interestedUsers.includes(userId);

  if (isInterested) {
    // Remove interest
    movie.interestedUsers = movie.interestedUsers.filter(id => id.toString() !== userId.toString());
    movie.interestCount = Math.max(0, movie.interestCount - 1);
  } else {
    // Add interest
    movie.interestedUsers.push(userId);
    movie.interestCount += 1;
  }

  await movie.save();

  res.json({
    success: true,
    message: isInterested ? "Removed from interested list" : "Added to interested list",
    interestCount: movie.interestCount,
    isInterested: !isInterested
  });
});

module.exports = { getAllMovies, getNowShowing, getUpcoming, getPremieres, getEvents, getMovieById, getMovieRecommendations, createMovie, updateMovie, deleteMovie, toggleMovieInterest };
