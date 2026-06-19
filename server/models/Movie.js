const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genre: [{ type: String }],
    language: [{ type: String }],
    duration: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 10 },
    poster: { type: String, required: true },
    backdrop: { type: String, default: "" },
    trailer: { type: String, default: "" },
    releaseDate: { type: Date },
    cast: [{ name: String, role: String, image: String }],
    crew: [{ name: String, role: String, image: String }],
    director: { type: String, default: "" },
    isNowShowing: { type: Boolean, default: true },
    isUpcoming: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    itemType: { type: String, enum: ["movie", "event", "premiere"], default: "movie" },
    basePrice: { type: Number, default: 0 },
    eventTime: { type: String, default: "" },
    eventLocation: { type: String, default: "" },
    eventAgeGroups: { type: String, default: "" },
    interestCount: { type: Number, default: 0 },
    interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Add indexes for frequent queries
movieSchema.index({ isActive: 1, itemType: 1 });
movieSchema.index({ isActive: 1, isNowShowing: 1 });
movieSchema.index({ isActive: 1, isUpcoming: 1 });
movieSchema.index({ title: 1 }); // for search

module.exports = mongoose.model("Movie", movieSchema);
