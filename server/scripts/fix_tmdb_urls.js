const mongoose = require("mongoose");
const Movie = require("./models/Movie");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB");
    
    const movies = await Movie.find();
    for (const m of movies) {
      let updated = false;
      let newPoster = m.poster;
      let newBackdrop = m.backdrop;

      if (newPoster && newPoster.includes("image.tmdb.org")) {
        newPoster = newPoster.replace("image.tmdb.org", "media.themoviedb.org");
        updated = true;
      }
      if (newBackdrop && newBackdrop.includes("image.tmdb.org")) {
        newBackdrop = newBackdrop.replace("image.tmdb.org", "media.themoviedb.org");
        updated = true;
      }

      if (updated) {
        m.poster = newPoster;
        m.backdrop = newBackdrop;
        await m.save();
        console.log(`Updated images for ${m.title}`);
      }
    }

    console.log("Finished updating URLs.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
