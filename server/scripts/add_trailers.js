const mongoose = require("mongoose");
const Movie = require("./models/Movie");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB");
    
    // Add trailer to Oppenheimer
    await Movie.findOneAndUpdate(
      { title: /Oppenheimer/i }, 
      { trailer: "https://www.youtube.com/embed/uYPbbksJxIg" }
    );
    console.log("Updated Oppenheimer trailer");

    // Add trailer to Deadpool & Wolverine
    await Movie.findOneAndUpdate(
      { title: /Deadpool/i }, 
      { trailer: "https://www.youtube.com/embed/73_1biulkYk" }
    );
    console.log("Updated Deadpool trailer");

    // Add trailer to Kalki
    await Movie.findOneAndUpdate(
      { title: /Kalki/i }, 
      { trailer: "https://www.youtube.com/embed/kQnOce1G66g" }
    );
    console.log("Updated Kalki trailer");

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
