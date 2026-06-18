const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Controllers
const { register, login, googleLogin, getProfile, updateProfile, forgotPassword, resetPassword } = require("../controllers/authController");
const { getAllMovies, getNowShowing, getUpcoming, getPremieres, getEvents, getMovieById, getMovieRecommendations, createMovie, updateMovie, deleteMovie } = require("../controllers/movieController");
const { getAllTheatres, getTheatreById, createTheatre, updateTheatre, deleteTheatre } = require("../controllers/theatreController");
const { getShowsByMovie, getShowById, getAllShows, createShow, updateShow, deleteShow } = require("../controllers/showController");
const { createBooking, getUserBookings, getBookingById, cancelBooking, getAllBookings } = require("../controllers/bookingController");
const { createPaymentIntent } = require("../controllers/paymentController");
const { getDashboardStats, getRevenueByMonth, getAllUsers } = require("../controllers/adminController");
const { uploadImage } = require("../controllers/uploadController");
const { getBanners, getAllAdminBanners, createBanner, updateBanner, deleteBanner } = require("../controllers/bannerController");
const { getMovieReviews, createReview, voteReview } = require("../controllers/reviewController");
const { validateCoupon } = require("../controllers/couponController");
const { getAllFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem } = require("../controllers/foodItemController");
const upload = require("../middleware/uploadMiddleware");

// ─────────────────────────────────────────────
//  UPLOAD ROUTES
// ─────────────────────────────────────────────
router.post("/upload", protect, adminOnly, upload.single("image"), uploadImage);

// ─────────────────────────────────────────────
//  AUTH ROUTES
// ─────────────────────────────────────────────
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/google", googleLogin);
router.get("/auth/profile", protect, getProfile);
router.put("/auth/profile", protect, updateProfile);
router.post("/auth/forgotpassword", forgotPassword);
router.put("/auth/resetpassword/:token", resetPassword);

// ─────────────────────────────────────────────
//  MOVIE ROUTES
// ─────────────────────────────────────────────
router.get("/movies", getAllMovies);
router.get("/movies/now-showing", getNowShowing);
router.get("/movies/upcoming", getUpcoming);
router.get("/movies/premieres", getPremieres);
router.get("/movies/events", getEvents);
router.get("/movies/:id", getMovieById);
router.get("/movies/:id/recommendations", getMovieRecommendations);
router.post("/movies", protect, adminOnly, createMovie);
router.put("/movies/:id", protect, adminOnly, updateMovie);
router.delete("/movies/:id", protect, adminOnly, deleteMovie);

// ─────────────────────────────────────────────
//  REVIEW ROUTES
// ─────────────────────────────────────────────
router.get("/reviews/movie/:movieId", getMovieReviews);
router.post("/reviews", protect, createReview);
router.put("/reviews/:id/vote", protect, voteReview);

// ─────────────────────────────────────────────
//  THEATRE ROUTES
// ─────────────────────────────────────────────
router.get("/theatres", getAllTheatres);
router.get("/theatres/:id", getTheatreById);
router.post("/theatres", protect, adminOnly, createTheatre);
router.put("/theatres/:id", protect, adminOnly, updateTheatre);
router.delete("/theatres/:id", protect, adminOnly, deleteTheatre);

// ─────────────────────────────────────────────
//  SHOW ROUTES
// ─────────────────────────────────────────────
router.get("/shows", protect, adminOnly, getAllShows);
router.get("/shows/movie/:movieId", getShowsByMovie);
router.get("/shows/:id", getShowById);
router.post("/shows", protect, adminOnly, createShow);
router.put("/shows/:id", protect, adminOnly, updateShow);
router.delete("/shows/:id", protect, adminOnly, deleteShow);

// ─────────────────────────────────────────────
//  BOOKING ROUTES
// ─────────────────────────────────────────────
router.post("/bookings", protect, createBooking);
router.get("/bookings/my", protect, getUserBookings);
router.get("/bookings/:id", protect, getBookingById);
router.put("/bookings/:id/cancel", protect, cancelBooking);

// ─────────────────────────────────────────────
//  PAYMENT ROUTES
// ─────────────────────────────────────────────
router.post("/payment/intent", protect, createPaymentIntent);

// ─────────────────────────────────────────────
//  COUPON ROUTES
// ─────────────────────────────────────────────
router.post("/coupons/validate", validateCoupon);

// ─────────────────────────────────────────────
//  ADMIN ROUTES
// ─────────────────────────────────────────────
router.get("/admin/stats", protect, adminOnly, getDashboardStats);
router.get("/admin/revenue", protect, adminOnly, getRevenueByMonth);
router.get("/admin/users", protect, adminOnly, getAllUsers);
router.get("/admin/bookings", protect, adminOnly, getAllBookings);
router.get("/admin/banners", protect, adminOnly, getAllAdminBanners);

// ─────────────────────────────────────────────
//  BANNER ROUTES
// ─────────────────────────────────────────────
router.get("/banners", getBanners);
router.post("/banners", protect, adminOnly, createBanner);
router.put("/banners/:id", protect, adminOnly, updateBanner);
router.delete("/banners/:id", protect, adminOnly, deleteBanner);

// ─────────────────────────────────────────────
//  FOOD / SNACK ROUTES
// ─────────────────────────────────────────────
router.get("/food", getAllFoodItems);
router.get("/food/:id", getFoodItemById);
router.post("/food", protect, adminOnly, createFoodItem);
router.put("/food/:id", protect, adminOnly, updateFoodItem);
router.delete("/food/:id", protect, adminOnly, deleteFoodItem);

module.exports = router;
