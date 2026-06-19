const mongoose = require("mongoose");
const Movie = require("./models/Movie");
require("dotenv").config();

const newMovies = [
  // Now Showing
  {
    title: "Kalki 2898 AD",
    description: "A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.",
    genre: ["Action", "Sci-Fi", "Thriller"],
    language: "Telugu, Hindi, Tamil",
    duration: "2h 50m",
    rating: 8.5,
    poster: "https://image.tmdb.org/t/p/w500/yZIn2Hofik8qYQ6iQx863m03sT2.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/9Y911B3M1fB9A6lZ9qQ1o2DqD9S.jpg",
    releaseDate: new Date("2024-06-27"),
    isNowShowing: true,
    isUpcoming: false
  },
  {
    title: "A Quiet Place: Day One",
    description: "A woman experiences the first day of the alien invasion in New York City.",
    genre: ["Horror", "Sci-Fi", "Thriller"],
    language: "English",
    duration: "1h 40m",
    rating: 7.8,
    poster: "https://image.tmdb.org/t/p/w500/yrpPYKijwdMTEOBmQLKwwM6sMWI.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/61O2h2DkS7g3dD7N0kP4W1fT5r.jpg",
    releaseDate: new Date("2024-06-28"),
    isNowShowing: true,
    isUpcoming: false
  },
  // Premieres
  {
    title: "Gladiator II",
    description: "Follows Lucius, the son of Maximus' love Lucilla, after Maximus' death.",
    genre: ["Action", "Adventure", "Drama"],
    language: "English",
    duration: "2h 30m",
    rating: 0,
    poster: "https://image.tmdb.org/t/p/w500/1E5baNhwAgC6b2MofV13O0R2mGH.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/6Y2v1N1eO9D9R2l1ZqQ1o2DqD9S.jpg",
    releaseDate: new Date("2024-11-22"),
    isNowShowing: false,
    isUpcoming: true
  },
  {
    title: "Venom: The Last Dance",
    description: "Eddie and Venom are on the run. Hunted by both of their worlds.",
    genre: ["Action", "Sci-Fi", "Thriller"],
    language: "English",
    duration: "2h 10m",
    rating: 0,
    poster: "https://image.tmdb.org/t/p/w500/A31Ww1N3y0m1mUo9Gk4uR1T1N5h.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/6Z2v1N1eO9D9R2l1ZqQ1o2DqD9S.jpg",
    releaseDate: new Date("2024-10-25"),
    isNowShowing: false,
    isUpcoming: true
  },
  {
    title: "Moana 2",
    description: "After receiving an unexpected call from her wayfinding ancestors, Moana journeys to the far seas of Oceania.",
    genre: ["Animation", "Adventure", "Family"],
    language: "English",
    duration: "1h 50m",
    rating: 0,
    poster: "https://image.tmdb.org/t/p/w500/aADpBhpIlVlO5wB9yXpLhD7Uq0o.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/6A2v1N1eO9D9R2l1ZqQ1o2DqD9S.jpg",
    releaseDate: new Date("2024-11-27"),
    isNowShowing: false,
    isUpcoming: true
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB");
    
    for (const movieData of newMovies) {
      await Movie.create(movieData);
      console.log(`Added movie: ${movieData.title}`);
    }
    
    console.log("Successfully seeded new movies!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
