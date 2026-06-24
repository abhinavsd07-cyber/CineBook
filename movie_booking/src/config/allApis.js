import axiosInstance from "./axiosConfig";

// ─────────────────────────────────────────────
//  AUTH APIs
// ─────────────────────────────────────────────
export const registerUser = (data) => axiosInstance.post("/auth/register", data);
export const loginUser = (data) => axiosInstance.post("/auth/login", data);
export const googleLoginUser = (data) => axiosInstance.post("/auth/google", data);
export const getProfile = () => axiosInstance.get("/auth/profile");
export const updateProfile = (data) => axiosInstance.put("/auth/profile", data);
export const forgotPassword = (data) => axiosInstance.post("/auth/forgotpassword", data);
export const resetPassword = (token, data) => axiosInstance.put(`/auth/resetpassword/${token}`, data);

// ─────────────────────────────────────────────
//  MOVIE APIs
// ─────────────────────────────────────────────
export const getAllMovies = (params) => axiosInstance.get("/movies", { params });
export const getNowShowing = (params) => axiosInstance.get("/movies/now-showing", { params });
export const getUpcoming = () => axiosInstance.get("/movies/upcoming");
export const getPremieres = () => axiosInstance.get("/movies/premieres");
export const getEvents = (params) => axiosInstance.get("/movies/events", { params });
export const getMovieById = (id) => axiosInstance.get(`/movies/${id}`);
export const getMovieRecommendations = (id) => axiosInstance.get(`/movies/${id}/recommendations`);
export const toggleMovieInterest = (id) => axiosInstance.put(`/movies/${id}/interest`);

// Admin Movie APIs
export const createMovie = (data) => axiosInstance.post("/movies", data);
export const updateMovie = (id, data) => axiosInstance.put(`/movies/${id}`, data);
export const deleteMovie = (id) => axiosInstance.delete(`/movies/${id}`);

// ─────────────────────────────────────────────
//  THEATRE APIs
// ─────────────────────────────────────────────
export const getAllTheatres = () => axiosInstance.get("/theatres");
export const getTheatreById = (id) => axiosInstance.get(`/theatres/${id}`);

// Admin Theatre APIs
export const createTheatre = (data) => axiosInstance.post("/theatres", data);
export const updateTheatre = (id, data) => axiosInstance.put(`/theatres/${id}`, data);
export const deleteTheatre = (id) => axiosInstance.delete(`/theatres/${id}`);

// ─────────────────────────────────────────────
//  SHOW APIs
// ─────────────────────────────────────────────
export const getShowsByMovie = (movieId, params) => axiosInstance.get(`/shows/movie/${movieId}`, { params });
export const getShowById = (id) => axiosInstance.get(`/shows/${id}`);

// Admin Show APIs
export const getAllShows = () => axiosInstance.get("/shows");
export const createShow = (data) => axiosInstance.post("/shows", data);
export const updateShow = (id, data) => axiosInstance.put(`/shows/${id}`, data);
export const deleteShow = (id) => axiosInstance.delete(`/shows/${id}`);

// ─────────────────────────────────────────────
//  BOOKING APIs
// ─────────────────────────────────────────────
export const createBooking = (data) => axiosInstance.post("/bookings", data);
export const getUserBookings = () => axiosInstance.get("/bookings/my");
export const getBookingById = (id) => axiosInstance.get(`/bookings/${id}`);
export const cancelBooking = (id) => axiosInstance.put(`/bookings/${id}/cancel`);

// ─────────────────────────────────────────────
//  PAYMENT APIs
// ─────────────────────────────────────────────
export const createPaymentIntent = (data) => axiosInstance.post("/payment/intent", data);

// ─────────────────────────────────────────────
//  ADMIN APIs
// ─────────────────────────────────────────────
export const getDashboardStats = () => axiosInstance.get("/admin/stats");
export const getRevenueByMonth = () => axiosInstance.get("/admin/revenue");
export const getAdminAnalytics = () => axiosInstance.get("/admin/analytics");
export const getAllUsers = () => axiosInstance.get("/admin/users");
export const getAllBookingsAdmin = (params) => axiosInstance.get("/admin/bookings", { params });

export const validateCoupon = (data) => axiosInstance.post("/coupons/validate", data);

// ─────────────────────────────────────────────
//  UPLOAD APIs
// ─────────────────────────────────────────────
export const uploadImage = (formData) => axiosInstance.post("/upload", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// ─────────────────────────────────────────────
//  REVIEW APIs
// ─────────────────────────────────────────────
export const getMovieReviews = (movieId) => axiosInstance.get(`/reviews/movie/${movieId}`);
export const createReview = (data) => axiosInstance.post("/reviews", data);
export const voteReview = (id, data) => axiosInstance.put(`/reviews/${id}/vote`, data);

// ─────────────────────────────────────────────
//  BANNER APIs
// ─────────────────────────────────────────────
export const getBanners = () => axiosInstance.get("/banners");
export const getAllAdminBanners = () => axiosInstance.get("/admin/banners");
export const createBanner = (data) => axiosInstance.post("/banners", data);
export const updateBanner = (id, data) => axiosInstance.put(`/banners/${id}`, data);
export const deleteBanner = (id) => axiosInstance.delete(`/banners/${id}`);

// ─────────────────────────────────────────────
//  FOOD / SNACK APIs
// ─────────────────────────────────────────────
export const getAllFoodItems = (params) => axiosInstance.get("/food", { params });
export const getFoodItemById = (id) => axiosInstance.get(`/food/${id}`);
export const createFoodItem = (data) => axiosInstance.post("/food", data);
export const updateFoodItem = (id, data) => axiosInstance.put(`/food/${id}`, data);
export const deleteFoodItem = (id) => axiosInstance.delete(`/food/${id}`);

