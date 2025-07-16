import mongoose from 'mongoose';
const trainScheduleSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Train',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    timeZone: {
      type: String,
    },
    stops: [
      {
        station: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Station',
          required: true,
        },
        distanceFromSource: {
          type: Number,
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
        stationsOrder: {
          type: Number,
          required: true,
        },
        availableSeats: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const TrainSchedule = mongoose.model('TrainSchedule', trainScheduleSchema);
export default TrainSchedule;
