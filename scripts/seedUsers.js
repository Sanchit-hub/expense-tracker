require("dotenv").config();

const bcrypt = require("bcrypt");

const connectDB = require("../config/db");
const User = require("../models/User");

const users = [
  {
    email: "admin@college.edu",
    password: "admin123",
    role: "admin"
  },
  {
    email: "viewer@college.edu",
    password: "viewer123",
    role: "viewer"
  }
];

async function seedUsers() {
  try {
    await connectDB();

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`User already exists: ${userData.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await User.create({
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });

      console.log(`Created ${userData.role}: ${userData.email}`);
    }
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    process.exit();
  }
}

seedUsers();
