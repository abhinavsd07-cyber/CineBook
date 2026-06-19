const mongoose = require("mongoose");
const Movie = require("./models/Movie");
require("dotenv").config();

const updates = [
  {
    title: /A Quiet Place/i,
    trailer: "https://www.youtube.com/embed/YPY7J-flzE8"
  },
  {
    title: /Gladiator II/i,
    trailer: "https://www.youtube.com/embed/4rgYUipGJNo"
  },
  {
    title: /Venom/i,
    trailer: "https://www.youtube.com/embed/__2bjWyncw0"
  },
  {
    title: /Moana 2/i,
    trailer: "https://www.youtube.com/embed/hDZ7y8RP5Hc"
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
            trailer: data.trailer
          } 
        }
      );
      console.log(`Updated trailer for ${data.title}`);
    }

    console.log("Finished updating more trailers.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
