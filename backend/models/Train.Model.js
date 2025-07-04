const mongoose = require('mongoose');

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
    mainDestination: {
      type: String,
      required: true,
    },
    sourceDepartureTime: {
      type: Date,
      required: true,
    },
    destinationArrivalTime: {
      type: Date,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    routes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
      },
    ],
  },
  { timestamps: true }
);

const Train = mongoose.model('Train', trainSchema);
export default Train;
