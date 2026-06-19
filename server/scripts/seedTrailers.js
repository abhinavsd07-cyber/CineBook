const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Movie = require("./models/Movie");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Update all movies to have a trailer if they don't already
    const res = await Movie.updateMany(
      { $or: [{ trailer: "" }, { trailer: { $exists: false } }] },
      { $set: { trailer: "https://www.youtube.com/embed/YoHD9XEInc0" } }
    );

    console.log(`Seed successful: Updated ${res.modifiedCount} movies with a trailer link.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
