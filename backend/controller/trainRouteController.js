import TrainRoutes from '../models/TrainRoute.Model.js';
import Station from '../models/Station.Model.js';
//create route
// @body - list of stations with A/D time, order of stations
export const setRoutes = async (req, res, next) => {
  const { stationArray } = req.body;
  if (
    !stationArray ||
    !Array.isArray(stationArray) ||
    stationArray.length < 2
  ) {
    const error = new Error('At least two stations are required');
    error.status = 400;
    return next(error);
  }
  try {
    const stations = [];

    for (const stop of stationArray) {
      const {
        name,
        arrivalTime,
        departureTime,
        distanceFromSource,
        stationsOrder,
        availableSeats,
      } = stop;
      console.log(name.toLowerCase());
      const station = await Station.findOne({
        name: name.toLowerCase(),
      });
      if (!station) {
        return res.status(404).json({ message: `Station not found: ${name}` });
      }
      stations.push({
        station: station._id,
        arrivalTime: new Date(arrivalTime),
        departureTime: new Date(departureTime),
        distanceFromSource,
        stationsOrder,
        availableSeats,
      });
    }
    const newRoute = new TrainRoutes({ stops: stations });
    const savedRoutes = await newRoute.save();
    res.json({ message: 'route created', data: savedRoutes, success: true });
  } catch (err) {
    const error = new Error(err.message || 'something went wrong in setRoute');
    return next(error);
  }
};

//get Routes - route id
export const getAllRoutes = async () => {};
