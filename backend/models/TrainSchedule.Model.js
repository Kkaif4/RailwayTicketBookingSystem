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
    }
  },
  { timestamps: true }
);

const TrainSchedule = mongoose.model('TrainSchedule', trainScheduleSchema);
export default TrainSchedule;
