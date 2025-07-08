import Train from '../models/Train.Model.js';
import Station from '../models/Station.Model.js';
import TrainRoutes from '../models/TrainRoute.Model.js';
import Seat from '../models/Seat.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';

// @params - train name, id, source, destination, time for D/A, seat no.
export const addTrain = async (req, res, next) => {
  const { trainName, routeId, arrival, departure, runningDays, totalSeats } =
    req.body;
  try {
    const Route = await TrainRoutes.findOne({ _id: routeId });
    const source = Route.stops[0].name;
    const destination = Route.stops[Route.stops.length - 1].name;
    const train = {
      trainNumber:
        source.charAt(0).toUpperCase() +
        destination.charAt(0).toUpperCase() +
        '-' +
        Math.floor(Math.random() * 1000),
      trainName,
      mainSource: source,
      mainDest: destination,
      sourceDepartureTime: departure,
      destArrivalTime: arrival,
      runningDays,
      totalSeats,
      route: routeId,
    };
    Route.stops.forEach((route) => (route.availableSeats = totalSeats));
    const newTrain = await Train.create(train);
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push({
        train: one._id,
        seatNumber:
          source.charAt(0) + destination.charAt(0) + '-seat-' + i.toString(),
      });
    }
    await Seat.insertMany(seats);

    const newSchedule = await TrainSchedule.create({ date, train: one._id });
    const route = newTrain.route;
    await route.populate('stops.station');
    const path = route.stops;
    let stops = [];
    path.forEach((stop) => {
      stops.push(stop.station.name);
    });
    const Data = {
      schedule: newSchedule.date,
      Train_Name: train.trainName,
      path: stops,
    };

    //sending response
    res.json({
      message: 'train created',
      data: one.trainName,
      schedule: Data,
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
    const trains = await Train.find().populate('routes');
    if (!trains || trains.length === 0) {
      const error = new Error('trains not found');
      error.status = 201;
      return next(error);
    }
    res.json({ data: trains, success: true });
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
    const schedule = await TrainSchedule.find({}).populate('train');
    res.json({ message: 'found schedule', success: true });
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong in searching train'
    );
    error.status = 400;
    return next(error);
  }
};
//add route to train with routes id and train id
export const addRouteToTrain = async () => {};

// name validation
// station validate
// update existing routes
// use id's
