import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    stops: [
      {
        station: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Station',
          required: true,
          // unique: [true, 'hello double hai ye'],
        },
        arrivalTime: {
          type: String,
          required: true,
        },
        departureTime: {
          type: String,
          required: true,
        },
        distanceFromSource: {
          type: Number,
          required: true,
        },
        availableSeats: {
          type: Number,
        },
        stationsOrder: {
          type: Number,
          required: true,
        },
      },
    ],
    routeCode: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', routeSchema);
export default Route;
