import mongoose from "mongoose";
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
      type: Date,
      required: true,
    },
    destArrivalTime: {
      type: Date,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Train = mongoose.model("Train", trainSchema);
export default Train;
