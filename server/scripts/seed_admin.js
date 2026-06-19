const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB");
    
    // Check if admin exists
    const admin = await User.findOne({ email: "admin@example.com" });
    if (!admin) {
      await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      });
      console.log("Admin user created: admin@example.com / admin123");
    } else {
      console.log("Admin user already exists");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
