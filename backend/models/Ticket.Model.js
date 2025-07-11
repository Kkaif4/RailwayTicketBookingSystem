import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Train',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    passengers: [
      {
        name: {
          type: String,
          required: true,
        },
        age: {
          type: Number,
          required: true,
        },
        seat: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Seat',
          required: true,
        },
      }
    ],
    arrivalTime: {
      type: String,
      required: true
    },
    departureTime: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Booked', 'Cancelled'],
      default: 'Booked'
    }
  },
  { timestamps: true }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
