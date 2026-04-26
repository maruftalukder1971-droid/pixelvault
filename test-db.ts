import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

async function test() {
  try {
    console.log("URI:", uri);

    await mongoose.connect(uri!);
    console.log("✅ MongoDB Connected");

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

test();
