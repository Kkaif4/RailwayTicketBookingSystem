import mongoose, { mongo } from 'mongoose';

const connectDB = async () => {
  try {
    // await mongoose.connect('mongodb://127.0.0.1:27017/mockRailway');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err.message);
    process.exit(1);
  }
};

export default connectDB;
