import Train from '../models/Train.Model.js';
import Station from '../models/Station.Model.js';
// @params - train name, id, source, destination, time for D/A, seat no.
export const addTrain = async (req, res, next) => {
  const { trainName, source, destination, arrival, departure, totalSeats } =
    req.body;

  const train = Train.find({
    trainName,
    mainSource: source,
    mainDest: destination,
  });
  if (train) {
    const error = new Error('Train already exist');
    error.status = 400;
    return next(error);
  }
  try {
    const sourceStation = SchemaTypeOptions.findOne({ name: source });
    const destStation = SchemaTypeOptions.findOne({ name: destination });
    if (!sourceStation || !destStation) {
      const error = new Error('Invalid source or destination station name');
      error.status = 400;
      return error;
    }
    const route = TrainRoutes.find().populate('stops.stations');
    
    const newTrain = {
      trainNumber: 100,
      trainName,
      mainSource: source,
      mainDest: destination,
      sourceDeparture: departure,
      destArrival: arrival,
      totalSeats,
      routes: route._id,
    };
  } catch (error) {}
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
