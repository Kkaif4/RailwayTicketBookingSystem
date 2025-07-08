import Ticket from '../models/Ticket.Model.js';
import Train from '../models/Train.Model.js';
import Route from '../models/TrainRoute.Model.js';
import Seat from '../models/Seat.Model.js';
import User from '../models/User.Model.js';

// BOOK TICKET
export const bookTicket = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { trainId, source, destination, date, passengers } = req.body;
  
      const passengerCount = passengers.length;
  
      //Fetch train with populated routes and stops
      const train = await Train.findById(trainId).populate({
        path: 'route',
        populate: {
          path: 'stops.station',
        },
      });
  
        if (!train) { 
            const error = new Error("Train not found");
            error.status = 404;
            return next(error);
        } 
  
      const route = train.route;
        if (!route){ 
            const error = new Error("Route not found");
            error.status = 404;
            return next(error);
        } 
  
      const stops = route.stops;
  

      //Get source and destination stops
      const sourceStop = stops.find(s => s.station.code.toLowerCase() === source.toLowerCase());
      const destStop = stops.find(s => s.station.code.toLowerCase() === destination.toLowerCase());
      

        if (!sourceStop || !destStop) {
            const error = new Error("Invalid source or destination");
            error.status = 400;
            return next(error);
      }
  
      const fromOrder = sourceStop.stationsOrder;
      const toOrder = destStop.stationsOrder;
  
        if (fromOrder >= toOrder) {
            const error = new Error("Invalid route direction");
            error.status = 400;
            return next(error);
      }
  
      //Check available seats across all segments
      const stationStops = stops.filter(
        (stop) => stop.stationsOrder >= fromOrder && stop.stationsOrder < toOrder
      );
  
      const allStationsHaveSeats = stationStops.every(
        (stop) => stop.availableSeats >= passengerCount
      );
  
        if (!allStationsHaveSeats) {
            const error = new Error("Not enough seats available for selected route");
            error.status = 400;
            return next(error);
      }
  
      //Assign available seats
      const bookedTickets = await Ticket.find({ train: trainId, date,status: 'Booked' });
      const bookedSeatIds = bookedTickets.flatMap((t) =>
        t.passengers.map((p) => p.seat.toString())
      );
  
      const availableSeats = await Seat.find({
        train: trainId,
        _id: { $nin: bookedSeatIds },
      }).limit(passengerCount);
  
      if (availableSeats.length < passengerCount) {
          const error = new Error("Seats unavailable");
          error.status = 400;
          return next(error);
      };
  
      const passengerList = passengers.map((p, i) => ({
        name: p.name,
        age: p.age,
        seat: availableSeats[i]._id,
      }));
  
      //Create ticket
      const farePerKm = 1.7;
      const distance = destStop.distanceFromSource - sourceStop.distanceFromSource;
      const totalPrice = farePerKm * distance * passengerCount;
  
      const ticket = await Ticket.create({
        user: userId,
        train: trainId,
        source,
        destination,
        date,
        distance,
        price: totalPrice,
        departureTime: sourceStop.departureTime,
        arrivalTime: destStop.arrivalTime,
        passengers: passengerList,
        status: 'Booked',
      });
  
      //Decrease availableSeats on affected stations
      route.stops.forEach((stop) => {
        if (stop.stationsOrder >= fromOrder && stop.stationsOrder < toOrder) {
          stop.availableSeats -= passengerCount;
        }
      });
  
      await route.save();
  
      //Add ticket to user
      await User.findByIdAndUpdate(userId, { $push: { tickets: ticket._id } });
  
      return res.status(201).json({ message: 'Ticket booked successfully', ticket, success: true });

    } catch (err) {
      console.error('Booking error:', err);
        const error = new Error("Error while booking tickets");
        error.status = 400;
        return next(error);
    }
  };

// GET MY TICKETS
export const getMyTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 3 } = req.query;

    const userId = req.user.id;
  
    const total = await Ticket.countDocuments({ user: userId });

    if (total === 0) {
      const error = new Error("No tickets found for this user");
      error.status = 404;
      return next(error);
    }
    
      // Fetch tickets with train and seat info populated
      const tickets = await Ticket.find({ user: userId })
        .populate({
          path: 'train',
          select: 'trainName trainNumber mainSource mainDest',
        })
        .populate({
          path: 'passengers.seat',
          select: 'seatNumber',
        })
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * (parseInt(limit)))
        .limit((parseInt(limit)));
      
    
      res.status(200).json({
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        tickets,
        success: true
      });
    
    } catch (err) {
        const error = new Error("Error fetching user tickets");
        error.status = 500;
        return next(error);
    }
};
  
//GET SINGLE TICKET
export const singleTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findById(ticketId)
      .populate({
        path: 'train',
        select: 'trainName trainNumber mainSource mainDest',
      })
      .populate({
        path: 'passengers.seat',
        select: 'seatNumber',
      });
    
    if (!ticket) {
      const error = new Error("Ticket not Found");
      error.status = 404;
      return next(error);
    }
    
    res.status(200).json({ ticket , success: true});

  } catch (err) {
    const error = new Error("Error fetching user tickets");
    error.status = 500;
    return next(error);
  }
};


// CANCEL TICKET
export const cancelTicket = async (req, res, next) => {
    try {
      const ticketId = req.params.ticketId;
      const userId = req.user.id;
  
      //Find ticket by id & user
      const ticket = await Ticket.findOne({ _id: ticketId, user: userId }).populate({
        path: 'train',
        populate: { path: 'route' }
      });
  
        if (!ticket) { 
            const error = new Error("Ticket not found");
            error.status = 404;
            return next(error);
        } 
  
      //Get route & stops
      const route = await Route.findById(ticket.train.route).populate('stops.station');
  
        if (!route) { 
            const error = new Error("Route not found");
            error.status = 404;
            return next(error);
        }
  
      const stops = route.stops;
  
      //Find source and destination stops by code
      const sourceStop = stops.find(s => s.station.code === ticket.source);
      const destStop = stops.find(s => s.station.code === ticket.destination);
  
      if (!sourceStop || !destStop) { 
        const error = new Error("Invalid Route Stops");
        error.status = 400;
        return next(error);
      };
  
      const fromOrder = sourceStop.stationsOrder;
      const toOrder = destStop.stationsOrder;
  
      //Increase availableSeats by number of passengers on all stops in that segment
      const passengerCount = ticket.passengers.length;
  
      route.stops.forEach(stop => {
        if (stop.stationsOrder >= fromOrder && stop.stationsOrder < toOrder) {
          stop.availableSeats += passengerCount;
        }
      });
  
      await route.save();
  
      //Mark ticket as cancelled
      ticket.status = 'Cancelled';
      await ticket.save()
  
      return res.json({ message: 'Ticket cancelled', ticket , success: true});

    } catch (err) {
        const error = new Error("Server Error");
        error.status = 500;
        return next(error);
    }
  };