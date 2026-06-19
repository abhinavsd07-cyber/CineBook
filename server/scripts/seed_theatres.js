require("dotenv").config();
const mongoose = require("mongoose");
const Theatre = require("./models/Theatre");

const popularCities = ["Mumbai", "Delhi-NCR", "Bengaluru", "Hyderabad", "Chandigarh", "Ahmedabad", "Pune", "Chennai", "Kolkata"];

const dummyTheatres = popularCities.flatMap((city) => [
  {
    name: `PVR Cinemas: ${city} Mall`,
    location: city,
    address: `Level 3, ${city} Central Mall, ${city}`,
    phone: "18001234567",
    totalScreens: 4,
    amenities: ["Parking", "Recliner Seats", "Dolby Atmos", "Food & Beverage"],
  },
  {
    name: `INOX: City Centre ${city}`,
    location: city,
    address: `2nd Floor, City Centre, ${city}`,
    phone: "18009876543",
    totalScreens: 3,
    amenities: ["Parking", "Dolby 7.1", "Wheelchair Accessible"],
  }
]);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    // Insert new theatres
    for (const t of dummyTheatres) {
      const exists = await Theatre.findOne({ name: t.name, location: t.location });
      if (!exists) {
        await Theatre.create(t);
        console.log(`Created: ${t.name} in ${t.location}`);
      }
    }
    console.log("Seeding complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
