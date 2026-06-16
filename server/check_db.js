require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Show = require('./models/Show');
const Theatre = require('./models/Theatre');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const karuppu = await Movie.findOne({ title: 'Karuppu' });
  console.log("Karuppu Movie:", karuppu);
  if (karuppu) {
    const shows = await Show.find({ movie: karuppu._id }).populate('theatre');
    console.log("Shows for Karuppu:", shows);
  }
  process.exit();
}
check();
