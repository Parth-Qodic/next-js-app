import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

const MONGODB_URI = process.env.MONGODB_URI;

// In development, use a global variable to preserve the mongoose connection
// across hot-reloads caused by HMR.
let cached = (globalThis as any).mongoose;

if (!cached) {
  cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(`🟢 Connected to MongoDB via Mongoose (${process.env.NODE_ENV})`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
