import mongoose from 'mongoose';
const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Station = mongoose.model('Station', stationSchema);
export default Station;
