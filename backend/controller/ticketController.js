import Ticket from '../models/Ticket.Model.js';
import Train from '../models/Train.Model.js';
import Seat from '../models/Seat.Model.js';
import User from '../models/User.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';

// BOOK TICKET
export const bookTicket = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { trainId, source, destination, date, passengers } = req.body;
    
    if (!trainId || !source || !destination || !date || !passengers || passengers.length===0) {
      const error = new Error("Please enter all the fields: trainId, source, destination, date and passengers");
      error.status = 400;
      return next(error);
    };
    
    const invalidPassenger = passengers.some(p =>
      !p.name ||!p.age);
    
    if (invalidPassenger) {
      const error = new Error("Each passenger must have a name and a age.");
      error.status = 400;
      return next(error);
    };

    // Validate format with regex
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      const error = new Error('Invalid date format, expected yyyy-mm-dd');
      error.status = 400;
      return next(error);
    };

    const passengerCount = passengers.length;

    const train = await Train.findById(trainId);

    if (!train) {
      const error = new Error("Train not found");
      error.status = 404;
      return next(error);
    };

    const bookingDate = new Date(date);

    if (isNaN(bookingDate.getTime())) {
      const error = new Error('Invalid date value, please enter a valid date in yyyy-mm-dd format');
      error.status = 400;
      return next(error);
    };
    
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    if (!train.runningDays.includes(dayOfWeek)) {
      const error = new Error(`Train does not run on ${dayOfWeek}`);
      error.status = 400;
      return next(error);
    };

    // Range search for schedule (fix for timezone issue)
    const startOfDay = new Date(new Date(bookingDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(bookingDate).setHours(23, 59, 59, 999));


    // Check if a schedule exists for that date
    const schedule = await TrainSchedule.findOne({
      train: trainId,
      status: 'scheduled',
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('stops.station').populate('train');

    if (!schedule) {
      return res.status(400).json({
        message: `Train is not scheduled for ${date}.`,
        success: false
      });
    };

    const route = schedule.stops;
    if (!route) {
      const error = new Error("Route not found");
      error.status = 404;
      return next(error);
    };

    const stops = schedule.stops;
    const sourceStop = stops.find(s => s.station.code.toLowerCase() === source.toLowerCase());
    const destStop = stops.find(s => s.station.code.toLowerCase() === destination.toLowerCase());

    if (!sourceStop || !destStop) {
      const error = new Error("Invalid source or destination");
      error.status = 400;
      return next(error);
    };

    const fromOrder = sourceStop.stationsOrder;
    const toOrder = destStop.stationsOrder;

    if (fromOrder >= toOrder) {
      const error = new Error("Invalid route direction");
      error.status = 400;
      return next(error);
    };

   
    const allBookedTickets = await Ticket.find({ train: trainId, date: bookingDate, status: 'Booked' });

    const seatMap = {}; // seatId => array of [fromOrder, toOrder] booked segments

    for (const ticket of allBookedTickets) {
      const tFrom = stops.find(s => s.station.code.toLowerCase() === ticket.source.toLowerCase())?.stationsOrder;
      const tTo = stops.find(s => s.station.code.toLowerCase() === ticket.destination.toLowerCase())?.stationsOrder;
      
      if (!tFrom || !tTo) continue; // safety check

      for (const passenger of ticket.passengers) {
        const seatId = passenger.seat.toString();
        if (!seatMap[seatId]) seatMap[seatId] = [];
        seatMap[seatId].push([tFrom, tTo]);
      }
    };

    const allSeats = await Seat.find({ train: trainId });
    const availableSeats = [];

    for (const seat of allSeats) {
      const seatId = seat._id.toString();
      const bookedSegments = seatMap[seatId] || [];

      // Check if ANY booked segment overlaps requested segment [fromOrder, toOrder)
      const isOverlapping = bookedSegments.some(([f, t]) => f < toOrder && t > fromOrder);

      if (!isOverlapping) {
        availableSeats.push(seat);
        if (availableSeats.length === passengerCount) break;
      }
    };

    if (availableSeats.length < passengerCount) {
      const error = new Error("Not enough seats available for this segment");
      error.status = 400;
      return next(error);
    }

    const passengerList = passengers.map((p, i) => ({
      name: p.name,
      age: p.age,
      seat: availableSeats[i]._id,
    }));

    const farePerKm = 1.7;
    const distance = destStop.distanceFromSource - sourceStop.distanceFromSource;
    const totalPrice = farePerKm * distance * passengerCount;

    const ticket = await Ticket.create({
      user: userId,
      train: trainId,
      source,
      destination,
      date: bookingDate,
      distance,
      price: totalPrice,
      departureTime: sourceStop.departureTime, 
      arrivalTime: destStop.arrivalTime,       
      passengers: passengerList,
      status: 'Booked',
    });

    schedule.stops.forEach(stop => {
      if (stop.stationsOrder >= fromOrder && stop.stationsOrder < toOrder) {
        stop.availableSeats -= passengerCount;
        if (stop.availableSeats < 0) stop.availableSeats = 0;//safety check
      }
    });

    await schedule.save();
    
    await User.findByIdAndUpdate(userId, { $push: { ticket: ticket._id } });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate({ path: 'train', select: 'trainName trainNumber mainSource mainDest' })
      .populate({ path: 'passengers.seat', select: 'seatNumber' });


    res.status(201).json({ message: 'Ticket booked successfully', populatedTicket, success: true });
  } catch (err) {
    console.log(err);
    const error = new Error("Error booking ticket");
    error.status = 500;
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
    };
      
    const tickets = await Ticket.find({ user: userId })
      .populate({ path: 'train', select: 'trainName trainNumber mainSource mainDest' })
      .populate({ path: 'passengers.seat', select: 'seatNumber' })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

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

// GET SINGLE TICKET
export const singleTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId;

    const ticket = await Ticket.findById(ticketId)
      .populate({ path: 'train', select: 'trainName trainNumber mainSource mainDest' })
      .populate({ path: 'passengers.seat', select: 'seatNumber' });

    if (!ticket) return next({ status: 404, message: 'Ticket not found' });

    res.status(200).json({ ticket, success: true });
  } catch (err) {
    const error = new Error("Error fetching ticket");
    error.status = 500;
    return next(error);
  }
};

// CANCEL TICKET
export const cancelTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId;
    const userId = req.user.id;

    const ticket = await Ticket.findOne({ _id: ticketId, user: userId })
      .populate('train');

    if (!ticket) {
      const error = new Error("Ticket not found");
      error.status = 404;
      return next(error);
    }

    if (ticket.status === "Cancelled") {
      const error = new Error("Ticket Already Cancelled");
      error.status = 400;
      return next(error);
    }

    // Find the schedule for this train and ticket date
    const schedule = await TrainSchedule.findOne({
      train: ticket.train._id,
      date: ticket.date,
    }).populate('stops.station').populate('train');

    if (!schedule) {
      const error = new Error("Train schedule not found");
      error.status = 404;
      return next(error);
    }

    const stops = schedule.stops;
    const sourceStop = stops.find(
      s => s.station.code.toLowerCase() === ticket.source.toLowerCase());
    const destStop = stops.find(
      s => s.station.code.toLowerCase() === ticket.destination.toLowerCase()
    );

    if (!sourceStop || !destStop) {
      const error = new Error("Invalid source or destination in ticket");
      error.status = 400;
      return next(error);
    }

    const fromOrder = sourceStop.stationsOrder;
    const toOrder = destStop.stationsOrder;
    const passengerCount = ticket.passengers.length;

    // Increment available seats in schedule route stops for the booked segment
    schedule.stops.forEach(stop => {
      if (stop.stationsOrder >= fromOrder && stop.stationsOrder < toOrder) {
        // Initialize if undefined
        if (typeof stop.availableSeats !== 'number') {
          stop.availableSeats = 0;
        }
        stop.availableSeats += passengerCount;

        // Optional safety: do not exceed train total seats
        if (schedule.train && schedule.train.totalSeats && stop.availableSeats > schedule.train.totalSeats) {
          stop.availableSeats = schedule.train.totalSeats;
        }
      }
    });

    await schedule.save();

    ticket.status = 'Cancelled';
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate({ path: 'train', select: 'trainName trainNumber mainSource mainDest' })
      .populate({ path: 'passengers.seat', select: 'seatNumber' });

    res.status(200).json({ message: 'Ticket cancelled successfully!', populatedTicket, success: true });

  } catch (err) {
    console.log(err);
    const error = new Error("Server error during cancellation");
    error.status = 500;
    return next(error);
  }
};

//running day sunday
//seats error Seats unavailable
//cancel same ticket