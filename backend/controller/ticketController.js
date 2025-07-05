import Ticket from '../models/Ticket.Model.js';
import Train from '../models/Train.Model.js';
import Route from '../models/TrainRoute.Model.js';
import Seat from '../models/Seat.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';

// BOOK TICKET
export const bookTicket = async (req, res, next) => {
  try {
    
  } catch (err) {
   
  }
};

// GET MY TICKETS
export const getMyTickets = async (req, res, next) => {
  try {
      const tickets = await Ticket.find({ user: req.user._id })
          .populate('train', 'trainName trainNumber')
          .populate('passengers.seat', 'seatNumber')
          .sort({ date: -1 });
      
      res.status(200).json({ tickets });
      
  } catch (err) {
      console.error(err);
      const error = new Error('Server Error');
      error.status = 500;
      return next(error);
    
  }
};

// CANCEL TICKET
export const cancelTicket = async (req, res, next) => {
    const { ticketId } = req.body;
  
    try {
      const ticket = await Ticket.findById(ticketId);
  
        if (!ticket) {
            const error = new Error('Ticket not found');
            error.status = 404;
            return next(error);
      }
  
    //going to be checked by authentication middleware
    //     if (ticket.user.toString() !== userId.toString()) {
    //         const error = new Error('You are not authorized to cancel this ticket');
    //         error.status = 403;
    //         return next(error);
    //   }
  
        if (ticket.status === 'cancelled') {
            const error = new Error('Ticket is already cancelled');
            error.status = 400;
            return next(error);
      }
  
      ticket.status = 'cancelled';
      await ticket.save();
  
      return res.status(200).json({ message: 'Ticket cancelled successfully' });
  
    } catch (err) {
        console.error(err);
        const error = new Error('Server Error');
        error.status = 500;
        return next(error);
    }
  };