const mongoose = require("mongoose");
const Movie = require("./models/Movie");
require("dotenv").config();

const updates = [
  {
    title: /Oppenheimer/i,
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBRoOoA0i.jpg"
  },
  {
    title: /Jawan/i,
    poster: "https://image.tmdb.org/t/p/w500/jILeBkUGQw1HIw9zBMEtwNAib2J.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/8pjWz2lt29KyVGoq1mXYu6Br7dE.jpg"
  },
  {
    title: /Leo/i,
    poster: "https://image.tmdb.org/t/p/w500/pD6sL4vEruI27jA1t7xK043s0P.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/nTPFkLUARmo1bYHcgobpyXW0G2v.jpg"
  },
  {
    title: /Avatar/i,
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrHezINNdIEep12LgbH5J0k.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtecwnsnTPhT2.jpg"
  },
  {
    title: /Dune: Part Two/i,
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqqC2m0.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj2S6.jpg"
  },
  {
    title: /Fighter/i,
    poster: "https://image.tmdb.org/t/p/w500/1lOWwED9A4nK82Y0iI0nL78lM6Q.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/6K22Lh20WqfUj339rL521WqE8L5.jpg"
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

    console.log("Finished updating posters.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
