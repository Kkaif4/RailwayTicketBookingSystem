import Train from '../models/Train.Model.js';
import Station from '../models/Station.Model.js';
import TrainRoutes from '../models/TrainRoute.Model.js';
// @params - train name, id, source, destination, time for D/A, seat no.
export const addTrain = async (req, res, next) => {
  const { trainName, source, destination, arrival, departure, totalSeats } =
    req.body;

  const train = await Train.findOne({
    trainName,
    mainSource: source,
    mainDest: destination,
  });
  if (train) {
    console.log(train);
    const error = new Error('Train already exist');
    error.status = 400;
    return next(error);
  }
  try {
    const sourceStation = Station.findOne({ name: source });
    const destStation = Station.findOne({ name: destination });
    if (!sourceStation || !destStation) {
      const error = new Error('Invalid source or destination station name');
      error.status = 400;
      return next(error);
    }
    const route = await TrainRoutes.findOne().populate('stops.stations');
    if (!route) {
      const error = new Error('Route not found');
      error.status = 400;
      return next(error);
    }
    const matchedRoute = route.find((route) => {
      const sortedStops = [...route.stops].sort(
        (a, b) => a.stationsOrder - b.stationsOrder
      );
      const firstStop = sortedStops[0];
      const lastStop = sortedStops[sortedStops.length - 1];

      return (
        firstStop.station.name.toLowerCase() === source.toLowerCase() &&
        lastStop.station.name.toLowerCase() === destination.toLowerCase()
      );
    });

    if (!matchedRoute) {
      const error = new Error('Route not found for this stations');
      error.status = 400;
      return next(error);
    }

    const newTrain = {
      trainNumber: 100,
      trainName,
      mainSource: source,
      mainDest: destination,
      sourceDeparture: departure,
      destArrival: arrival,
      totalSeats,
      routes: matchedRoute._id,
    };
    console.log(newTrain);
    const one = await Train.create(newTrain);
    res.json({
      message: 'train created',
      data: one.trainName,
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
    res.json({ data: trains, success: true });
  } catch (err) {
    const error = new Error(
      err.message || 'internal server error getting trains'
    );
    error.status = 400;
    return next(error);
  }
};

//getting searched trains based on source and destination also date from schedule
export const getSearchTrain = async (req, res, next) => {
  const {
    source = 'latur',
    destination = 'pune',
    date = new Date(Date.now() + 24 * 60 * 60 * 1000),
  } = req.query;

  const query = { mainSource: source, mainDestination: destination };
  const routes = await TrainRoutes.find({
    'stops.station': { $all: [source, destination] },
  }).populate('stops.station');

  const train = await Train.find(query);
};

//add route to train with routes id and train id
export const addRouteToTrain = async () => {};
