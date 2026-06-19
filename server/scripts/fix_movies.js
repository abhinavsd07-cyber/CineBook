require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const res1 = await Movie.updateMany(
    { itemType: { $exists: false } },
    { $set: { itemType: 'movie' } }
  );
  console.log('Fixed missing itemType:', res1.modifiedCount);

  // Just to be absolutely certain, let's fix any that might have itemType as null or empty string
  const res2 = await Movie.updateMany(
    { itemType: { $in: [null, ""] } },
    { $set: { itemType: 'movie' } }
  );
  console.log('Fixed null/empty itemType:', res2.modifiedCount);
  
  process.exit(0);
});
