import Train from '../models/Train.Model.js';
import Station from '../models/Station.Model.js';
import Seat from '../models/Seat.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';

// @params - train name, id, source, destination, time for D/A, seat no.
export const addTrain = async (req, res, next) => {
  const { trainName, totalSeats, source, destination } = req.body;
  try {
    const train = new Train({
      trainNumber:
        source.charAt(0).toUpperCase() +
        destination.charAt(0).toUpperCase() +
        '-' +
        Math.floor(Math.random() * 1000),
      trainName,
      mainSource: source.toLowerCase(),
      mainDest: destination.toLowerCase(),
      totalSeats,
    });
    const newTrain = await train.save();
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push({
        train: newTrain._id,
        seatNumber:
          source.charAt(0) + destination.charAt(0) + '-seat-' + i.toString(),
      });
    }
    await Seat.insertMany(seats);
    res.json({
      message: 'train created',
      data: {
        name: newTrain.trainName,
        number: newTrain.trainNumber,
      },
      success: true,
    });
  } catch (err) {
    const error = new Error(
      err.message || 'Internal server error in adding train'
    );
    error.status = 500;
    return next(error);
  }
};

//getting all trains
export const getAllTrains = async (req, res, next) => {
  try {
    const trains = await Train.find();
    if (!trains || trains.length === 0) {
      const error = new Error('trains not found');
      error.status = 201;
      return next(error);
    }
    const trainNames = trains.map((train) => train.trainName);
    res.json({ message: 'trains found', data: trainNames, success: true });
  } catch (err) {
    const error = new Error(
      err.message || 'internal server error getting trains'
    );
    error.status = 400;
    return next(error);
  }
};

export const getTrainById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const train = await Train.findById({ _id: id });
    if (!train) {
      const error = new Error('trains not found for this id');
      error.status = 201;
      return next(error);
    }
    const seats = await Seat.find({ train: train._id });
    res.json({
      message: 'train found',
      data: train,
      seats: seats,
      success: true,
    });
  } catch (err) {
    const error = new Error(err.message || 'Error finding train by id');
    error.status = 400;
    return next(error);
  }
};

export const getSearchTrainOld = async (req, res, next) => {
  const { source, destination, date = Date.now() + 1 } = req.query;
  console.log(date);
  try {
    //? finding station
    const srcStation = await Station.findOne({ name: source });
    const destStation = await Station.findOne({ name: destination });

    if (!srcStation || !destStation) {
      const error = new Error('Source and destination not found');
      error.status = 400;
      return next(error);
    }

    const sourceId = srcStation._id;
    const destinationId = destStation._id;

    //? finding route for source and destination
    const matchingRoutes = await TrainRoutes.find({
      'stops.station': { $all: [sourceId, destinationId] },
    }).populate('stops.station');

    if (!matchingRoutes) {
      const error = new Error(
        'Route not found for this source and destination'
      );
      error.status = 201;
      return next(error);
    }

    //? finding valid route based on the source and destination
    const validRoutes = matchingRoutes.filter((route) => {
      const stops = route.stops;

      const sourceStop = stops.find((stop) =>
        stop.station._id.equals(sourceId)
      );
      const destStop = stops.find((stop) =>
        stop.station._id.equals(destinationId)
      );
      if (!sourceStop || !destStop) return false;

      return sourceStop.stationsOrder < destStop.stationsOrder;
    });

    if (!validRoutes) {
      const error = new Error('Route not valid for source and destination');
      error.status = 400;
      return next(error);
    }
    const train = await Train.findOne({
      route: validRoutes[0]._id,
    });
    if (!train || !train.isActive) {
      const error = new Error('Train not found or inactive');
      error.status = 201;
      return next(error);
    }
    res.json({ message: 'Train found', data: train, success: true });
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong in searching train'
    );
    error.status = 400;
    return next(error);
  }
};

export const getSearchTrain = async (req, res, next) => {
  const { source, destination, date = Date.now() } = req.query;

  try {
    const srcStation = await Station.findOne({ name: source });
    const destStation = await Station.findOne({ name: destination });
    if (!srcStation || !destStation) {
      const error = new Error('Source or destination station not found');
      error.status = 404;
      return next(error);
    }
    const sourceId = srcStation._id;
    const destinationId = destStation._id;

    const schedule = await TrainSchedule.find({});
    if (!schedule) {
      const error = new Error('No train schedule found');
      error.status = 404;
      return next(error);
    }

    const filterSchedule = await TrainSchedule.find({
      'stops.station': { $all: [sourceId, destinationId] },
    }).populate('train.route.stops.station');

    if (!filterSchedule || filterSchedule.length === 0) {
      const error = new Error(
        'No schedule found for this source and destination'
      );
      error.status = 404;
      return next(error);
    }
    res.json({
      message: 'found schedule',
      data: filterSchedule,
      success: true,
    });
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong in searching train'
    );
    error.status = 400;
    return next(error);
  }
};

//add route to train with routes id and train id
// name validation
// station validate
// update existing routes
// use id's
