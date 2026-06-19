require('dotenv').config();
const mongoose = require('mongoose');
const Show = require('./models/Show');
const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const shows = await Show.find({ isActive: true })
    .populate({
      path: 'theatre',
      match: { location: { $regex: new RegExp(`^Mumbai$`, 'i') } },
      select: '_id location'
    })
    .select('movie theatre');

  const validShows = shows.filter((s) => s.theatre !== null);
  console.log('Valid shows count:', validShows.length);
  
  const validMovieIds = [...new Set(validShows.map((s) => s.movie.toString()))];
  console.log('Valid movie IDs:', validMovieIds);

  const m1 = await Movie.find({ _id: { $in: validMovieIds }, isNowShowing: true });
  const m2 = await Movie.find({ _id: { $in: validMovieIds }, isActive: true });
  const m3 = await Movie.find({ _id: { $in: validMovieIds }, itemType: "movie" });
  console.log("isNowShowing match:", m1.length);
  console.log("isActive match:", m2.length);
  console.log("itemType match:", m3.length);
  process.exit(0);
});
