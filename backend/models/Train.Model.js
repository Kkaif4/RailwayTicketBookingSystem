import mongoose from 'mongoose';
const trainSchema = new mongoose.Schema(
  {
    trainNumber: {
      type: String,
      required: true,
      unique: true,
    },
    trainName: {
      type: String,
      required: true,
    },
    mainSource: {
      type: String,
      required: true,
    },
    mainDest: {
      type: String,
      required: true,
    },
    sourceDepartureTime: {
      type: String,
      required: true,
    },
    destArrivalTime: {
      type: String,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    //one train only assigned for one route
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      unique: true,
    },
    runningDays: [{ type: String, required: true }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Train = mongoose.model('Train', trainSchema);
export default Train;
