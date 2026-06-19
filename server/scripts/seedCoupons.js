const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Coupon = require("./models/Coupon");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    await Coupon.deleteMany(); // Clear old coupons

    await Coupon.create({
      code: "WELCOME20",
      discountPercent: 20,
      isActive: true,
    });

    console.log("Seed successful: WELCOME20 coupon added.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
