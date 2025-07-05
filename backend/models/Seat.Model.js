import mongoose from 'mongoose';
const seatSchema = new mongoose.Schema(
  {
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Train',
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Seat = mongoose.model('Seat', seatSchema);
export default Seat;
