const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: 0,
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: ["Bestsellers", "Popcorn", "Beverages", "Snacks", "Combos"],
    },
    veg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FoodItem", foodItemSchema);
