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
          type: Date,
          required: true,
        },
        departureTime: {
          type: Date,
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
        //! Still in edit
      },
    ],
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', routeSchema);
export default Route;

