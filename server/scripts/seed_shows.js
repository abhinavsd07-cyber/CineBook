require("dotenv").config();
const mongoose = require("mongoose");
const Movie = require("./models/Movie");
const Theatre = require("./models/Theatre");
const Show = require("./models/Show");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB for seeding shows...");

    // Get a few movies that are nowShowing
    const movies = await Movie.find({ isNowShowing: true }).limit(5);
    // Get Mumbai theatres
    const theatres = await Theatre.find({ location: "Mumbai" });

    if (movies.length === 0 || theatres.length === 0) {
      console.log("No movies or Mumbai theatres found! Please run other seeders first.");
      process.exit(1);
    }

    // Default seats
    const defaultSeats = {
      gold: { total: 50, booked: [], price: 250 },
      premium: { total: 50, booked: [], price: 350 },
      vip: { total: 20, booked: [], price: 500 },
    };

    let showCount = 0;

    for (const movie of movies) {
      for (const theatre of theatres) {
        // Create a couple of shows for each movie in each theatre
        const showTimes = ["10:00 AM", "01:30 PM", "06:00 PM"];
        
        // Use tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        for (const time of showTimes) {
          const showExists = await Show.findOne({
            movie: movie._id,
            theatre: theatre._id,
            date: tomorrow.toISOString().split("T")[0],
            time: time,
          });

          if (!showExists) {
            await Show.create({
              movie: movie._id,
              theatre: theatre._id,
              date: tomorrow.toISOString().split("T")[0],
              time: time,
              screen: "Screen 1",
              format: "2D",
              language: movie.language[0] || "Hindi",
              seats: defaultSeats,
            });
            showCount++;
          }
        }
      }
    }

    console.log(`Successfully seeded ${showCount} shows in Mumbai!`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
