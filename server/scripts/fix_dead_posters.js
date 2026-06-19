const mongoose = require("mongoose");
const Movie = require("./models/Movie");
require("dotenv").config();

const updates = [
  {
    title: /Kalki 2898 AD/i,
    poster: "https://m.media-amazon.com/images/M/MV5BMTgzYmQ0NWUtZWRmOS00MTUzLWJhYzItN2ExYWJjMWI0MDkxXkEyXkFqcGc@._V1_SX300.jpg"
  },
  {
    title: /A Quiet Place/i,
    poster: "https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg"
  },
  {
    title: /Interstellar/i,
    poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg"
  },
  {
    title: /Dune: Part Two/i,
    poster: "https://m.media-amazon.com/images/M/MV5BODdjMjM3NGQtZDA5OC00NGE4LWIyZDQtZjYwOGZlMTM5ZTQ1XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg"
  },
  {
    title: /Oppenheimer/i,
    poster: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODktNzc2NDRjZjU0MzZlXkEyXkFqcGdeQXVyMzgwNTU2ODQ@._V1_SX300.jpg"
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB");
    for (const data of updates) {
      await Movie.updateMany(
        { title: data.title },
        { $set: { poster: data.poster } }
      );
      console.log(`Updated images for ${data.title}`);
    }

    // Also let's proxy any remaining tmdb/themoviedb links
    const movies = await Movie.find();
    for (const m of movies) {
      if (m.poster && m.poster.includes("themoviedb.org")) {
        m.poster = `https://images.weserv.nl/?url=${encodeURIComponent(m.poster)}`;
        await m.save();
      } else if (m.poster && m.poster.includes("image.tmdb.org")) {
        m.poster = `https://images.weserv.nl/?url=${encodeURIComponent(m.poster)}`;
        await m.save();
      }
    }

    console.log("Finished updating posters.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
