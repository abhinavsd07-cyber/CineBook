const mongoose = require("mongoose");
const Movie = require("./models/Movie");
require("dotenv").config();

const updates = [
  {
    title: /Spider-Man/i,
    poster: "https://image.tmdb.org/t/p/w500/8Zq1vN3vFmbXQJntG9uYcQvWk6.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/vI3aPTg8X1j13RGEzEht008TtvY.jpg"
  },
  {
    title: /Interstellar/i,
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MvrIdlsR.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg"
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB");
    
    for (const data of updates) {
      await Movie.updateMany(
        { title: data.title },
        { 
          $set: { 
            poster: data.poster,
            backdrop: data.backdrop
          } 
        }
      );
      console.log(`Updated images for ${data.title}`);
    }

    console.log("Finished updating more posters.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
