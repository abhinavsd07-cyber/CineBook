import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// User Pages
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Offers from "./pages/Offers";
import GiftCards from "./pages/GiftCards";
import Stream from "./pages/Stream";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import MovieDetails from "./pages/MovieDetails";
import EventDetails from "./pages/EventDetails";
import TheatreSelection from "./pages/TheatreSelection";
import SeatSelection from "./pages/SeatSelection";
import EventTicketSelection from "./pages/EventTicketSelection";
import FoodSelection from "./pages/FoodSelection";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";
import TicketScanner from "./pages/TicketScanner";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyBookings from "./pages/MyBookings";
import ListYourShow from "./pages/ListYourShow";
import Corporates from "./pages/Corporates";

// Admin Pages
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import ManageMovies from "./admin/pages/ManageMovies";
import ManageTheatres from "./admin/pages/ManageTheatres";
import ManageShows from "./admin/pages/ManageShows";
import ManageBookings from "./admin/pages/ManageBookings";
import ManageBanners from "./admin/pages/ManageBanners";
import ManageSnacks from "./admin/pages/ManageSnacks";

import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Bounce } from "react-toastify";
import Chatbot from "./components/Chatbot";

const UserLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <LocationProvider>
        <Router>
          <ScrollToTop />
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<UserLayout><Home /></UserLayout>} />
          <Route path="/explore" element={<UserLayout><Explore /></UserLayout>} />
          <Route path="/stream" element={<UserLayout><Stream /></UserLayout>} />
          <Route path="/offers" element={<UserLayout><Offers /></UserLayout>} />
          <Route path="/giftcards" element={<UserLayout><GiftCards /></UserLayout>} />
          <Route path="/list-your-show" element={<UserLayout><ListYourShow /></UserLayout>} />
          <Route path="/corporates" element={<UserLayout><Corporates /></UserLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<UserLayout><Profile /></UserLayout>} />
          <Route path="/movie/:id" element={<UserLayout><MovieDetails /></UserLayout>} />
          <Route path="/events/:id" element={<UserLayout><EventDetails /></UserLayout>} />
          <Route path="/select-theatre/:movieId" element={<UserLayout><TheatreSelection /></UserLayout>} />
          <Route path="/event-tickets/:id" element={<UserLayout><EventTicketSelection /></UserLayout>} />

          {/* ── Protected User Routes ── */}
          <Route
            path="/seat/:movieId/:theatreId/:showId"
            element={<UserLayout><SeatSelection /></UserLayout>}
          />
          <Route
            path="/food"
            element={<ProtectedRoute><UserLayout><FoodSelection /></UserLayout></ProtectedRoute>}
          />
          <Route
            path="/payment"
            element={<ProtectedRoute><UserLayout><Payment /></UserLayout></ProtectedRoute>}
          />
          <Route
            path="/payment-success"
            element={<ProtectedRoute><UserLayout><PaymentSuccess /></UserLayout></ProtectedRoute>}
          />
          <Route
            path="/my-bookings"
            element={<ProtectedRoute><UserLayout><MyBookings /></UserLayout></ProtectedRoute>}
          />

          {/* ── Admin Routes ── */}
          <Route
            path="/admin"
            element={<AdminRoute><AdminLayout /></AdminRoute>}
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="movies" element={<ManageMovies />} />
            <Route path="theatres" element={<ManageTheatres />} />
            <Route path="shows" element={<ManageShows />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="snacks" element={<ManageSnacks />} />
            <Route path="banners" element={<ManageBanners />} />
          </Route>

          <Route
            path="/admin-dashboard"
            element={<AdminRoute><UserLayout><AdminDashboard /></UserLayout></AdminRoute>}
          />
          <Route
            path="/staff/scanner"
            element={<AdminRoute><UserLayout><TicketScanner /></UserLayout></AdminRoute>}
          />
          <Route path="/food" element={<UserLayout><FoodSelection /></UserLayout>} />

          {/* ── 404 ── */}
          <Route
            path="*"
            element={
              <UserLayout>
                <div className="page-loader" style={{ minHeight: "80vh" }}>
                  <h1 style={{ fontSize: "5rem", color: "var(--clr-accent)" }}>404</h1>
                  <p style={{ color: "var(--clr-text-muted)" }}>Page not found</p>
                  <a href="/" className="btn btn-primary mt-6">Go Home</a>
                </div>
              </UserLayout>
            }
          />
        </Routes>
        <Chatbot />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
      </Router>
      </LocationProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
