import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

interface Cache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
declare global { var mongooseCache: Cache | undefined }

const cached: Cache = global.mongooseCache ?? { conn: null, promise: null };
if (!global.mongooseCache) global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
console.log("Mongo URI exists:", !!MONGODB_URI);
