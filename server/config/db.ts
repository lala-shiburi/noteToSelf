import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('MongoDB connection failed:', message);
    process.exit(1);
  }
}
