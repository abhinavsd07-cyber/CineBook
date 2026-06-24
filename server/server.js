const dotenv = require("dotenv");
dotenv.config();

// Fix for Node.js DNS resolution issues on Windows (ECONNREFUSED for SRV queries)
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./dbConfig/db");
const route = require("./routes/route");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.set("socketio", io);

// In-memory store for active temporary locks: { [showId]: { [seatId]: socketId } }
const lockedSeats = {};

io.on("connection", (socket) => {
  // console.log(`Socket connected: ${socket.id}`);
  
  socket.on("joinShow", (showId) => {
    socket.join(showId);
    // Send currently locked seats in this show room to the joining client
    const currentLocks = lockedSeats[showId] ? Object.keys(lockedSeats[showId]) : [];
    socket.emit("currentLocks", currentLocks);
  });

  socket.on("lockSeat", ({ showId, seatId }) => {
    if (!lockedSeats[showId]) {
      lockedSeats[showId] = {};
    }
    lockedSeats[showId][seatId] = socket.id;
    // Broadcast to others in the same show room
    socket.to(showId).emit("seatLocked", { seatId, by: socket.id });
  });

  socket.on("unlockSeat", ({ showId, seatId }) => {
    if (lockedSeats[showId] && lockedSeats[showId][seatId] === socket.id) {
      delete lockedSeats[showId][seatId];
    }
    // Broadcast to others in the same show room
    socket.to(showId).emit("seatUnlocked", { seatId, by: socket.id });
  });

  socket.on("disconnect", () => {
    // Find all seats locked by this socket ID across all shows and unlock them
    for (const showId in lockedSeats) {
      for (const seatId in lockedSeats[showId]) {
        if (lockedSeats[showId][seatId] === socket.id) {
          delete lockedSeats[showId][seatId];
          io.to(showId).emit("seatUnlocked", { seatId, by: socket.id });
        }
      }
    }
  });
});

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (req, res) => {
  res.json({ success: true, message: "🎬 cineBook API is running..." });
});

// API Routes
app.use("/api", route);
app.use("/api/admin", adminRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
