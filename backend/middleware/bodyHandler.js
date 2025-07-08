import TrainRoutes from '../models/TrainRoute.Model.js';
import Train from '../models/Train.Model.js';
import Route from '../models/TrainRoute.Model.js';

export const checkAddTrain = async (req, res, next) => {
  const { trainName, arrival, departure, routeId, runningDays, totalSeats } =
    req.body;
  if (
    !trainName ||
    !arrival ||
    !departure ||
    !routeId ||
    !runningDays ||
    !totalSeats
  ) {
    const error = new Error('Data is invalid');
    error.status = 400;
    return next(error);
  }
  if (
    typeof trainName !== 'string' ||
    trainName.trim() === '' ||
    typeof routeId !== 'string' ||
    routeId.trim() === '' ||
    typeof source !== 'string' ||
    source.trim() === '' ||
    typeof destination !== 'string' ||
    destination.trim() === ''
  ) {
    const error = new Error('Data is invalid');
    error.status = 400;
    return next(error);
  }
  if (!Array.isArray(runningDays)) {
    const error = new Error('running day are not valid');
    error.status = 400;
    return next(error);
  }

  // const days = [
  //   'sunday',
  //   'monday',
  //   'wednesday',
  //   'tuesday',
  //   'thursday',
  //   'friday',
  //   'saturday',
  // ];

  const days = {
    sunday: true,
    monday: true,
    wednesday: true,
    tuesday: true,
    thursday: true,
    friday: true,
    saturday: true,
  };

  //validating every day using object. (using "every" loop)
  const isValid = runningDays.every((day) => days[day.toLowerCase()]);
  if (!isValid) {
    const error = new Error('running days are not valid');
    error.status = 400;
    return next(error);
  }

  if (isNaN(totalSeats)) {
    const error = new Error('seats are not valid');
    error.status = 400;
    return next(error);
  }

  try {
    const Route = await TrainRoutes.findById({ _id: routeId });
    if (!Route || !Route.length) {
      const error = new Error('Route does not exist');
      error.status = 400;
      return next(error);
    }
    const train = await Train.findOne({
      trainName,
      route: routeId,
    });
    if (train) {
      const error = new Error('Train already exist');
      error.status = 400;
      return next(error);
    }
    next();
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong in middleware'
    );
    error.status = 400;
    return next(error);
  }
};

export const checkAddRoute = async (req, res, next) => {
  const { stationArray } = req.body;
  if (!stationArray) {
    const error = new Error('stations are not valid');
    error.status = 400;
    return next(error);
  }
  const done = [];
  let code = '';
  stationArray.forEach((station) => {
    if (done.includes(station.name)) {
      const error = new Error('duplicate station detected');
      error.status = 400;
      return next(error);
    }
    done.push(station.name);
    if (!station.arrivalTime || !station.departureTime) {
      const error = new Error('departure or arrival time is empty');
      error.status = 400;
      return next(error);
    }
    const one = checkTime(station.arrivalTime, station.departureTime);
    if (!one) {
      const error = new Error(
        `departure or arrival time is wrong for ${station.name}`
      );
      error.status = 400;
      return next(error);
    }
    code += station.name[0];
  });
  const route = await Route.findOne({ routeCode: code });
  if (route) {
    const error = new Error('duplicate route stations detected');
    error.status = 400;
    return next(error);
  }
  next();
};

const checkTime = (Arrival, Departure) => {
  const [arrivalHour, arrivalMinute] = Arrival.split(':');
  const [departureHour, departureMinute] = Departure.split(':');
  const arrival = new Date();
  const departure = new Date();
  arrival.setHours(+arrivalHour);
  arrival.setMinutes(+arrivalMinute);
  departure.setHours(+departureHour);
  departure.setMinutes(+departureMinute);
  if (departure < arrival) {
    return false;
  }
  return true;
};
