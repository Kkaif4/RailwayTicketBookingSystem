import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    stops: [
      {
        station: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Station',
          required: true,
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
        stationsOrder: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', routeSchema);
export default Route;

