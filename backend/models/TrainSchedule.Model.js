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
    },
    trainName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Train',
      required: true,
    },
    stations: [
      {
        name: {
          type: String,
        },
        arrival: {
          type: String,
        },
        departure: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const TrainSchedule = mongoose.model('TrainSchedule', trainScheduleSchema);
export default TrainSchedule;
