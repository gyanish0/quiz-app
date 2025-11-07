// scripts/createAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import connectDB from "../lib/db.js";

dotenv.config();

async function createAdmin() {
    await connectDB();

    const username = "gyanish_admin";
    const password = "Gyanish123";

    // Check if admin already exists
    const existing = await Admin.findOne({ username });
    if (existing) {
        console.log("⚠️ Admin user already exists");
        process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
        username,
        password: hashedPassword,
    });

    console.log("✅ Admin user created successfully:");
    console.log({
        username: admin.username,
        password: "Your plain password is: " + password,
    });

    process.exit(0);
}

createAdmin();
