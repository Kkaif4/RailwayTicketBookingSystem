import Train from '../models/Train.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';
import mongoose from 'mongoose';
import Station from '../models/Station.Model.js';

export const checkAddTrain = async (req, res, next) => {
  const { trainName, runningDays, totalSeats, source, destination } = req.body;
  if (!trainName || !runningDays) {
    const error = new Error('Data is invalid');
    error.status = 400;
    return next(error);
  }
  if (
    typeof trainName !== 'string' ||
    trainName.trim() === '' ||
    typeof source !== 'string' ||
    source.trim() === '' ||
    typeof destination !== 'string' ||
    destination.trim() === ''
  ) {
    const error = new Error('Data is invalid');
    error.status = 400;
    return next(error);
  }

  try {
    const train = await Train.findOne({
      trainName,
      mainSource: source,
      mainDest: destination,
    });
    if (train) {
      const error = new Error('Train already exist');
      error.status = 400;
      return next(error);
    }
    const srcStation = await Station.findOne({ name: source.toLowerCase() });
    const destStation = await Station.findOne({
      name: destination.toLowerCase(),
    });
    if (!srcStation) {
      const error = new Error(
        `Source or destination station does not exist: ${source}`
      );
      error.status = 404;
      return next(error);
    }
    if (!destStation) {
      const error = new Error(
        `Source or destination station does not exist: ${destination}`
      );
      error.status = 404;
      return next(error);
    }
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong in middleware'
    );
    error.status = 400;
    return next(error);
  }
  if (isNaN(totalSeats) || !totalSeats || totalSeats <= 0) {
    const error = new Error('seats are invalid');
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
  next();
};

export const scheduleCheck = async (req, res, next) => {
  const { trainId, date, stops, mainDepartureTime, mainArrivalTime } = req.body;

  // Validate required fields
  if (!trainId || !date || !mainDepartureTime || !mainArrivalTime || !stops) {
    const error = new Error('All fields are required');
    error.status = 400;
    return next(error);
  }
  if (!Array.isArray(stops) || stops.length === 0) {
    const error = new Error('stops must be an array and cannot be empty');
    error.status = 400;
    return next(error);
  }
  // Validate top-level times as valid dates
  if (
    isNaN(Date.parse(mainDepartureTime)) ||
    isNaN(Date.parse(mainArrivalTime))
  ) {
    const error = new Error(
      'mainDepartureTime and mainArrivalTime must be valid ISO date strings'
    );
    error.status = 400;
    return next(error);
  }
  // Validate stops and resolve station names to ObjectIds
  for (const stop of stops) {
    if (
      !stop.station ||
      !stop.arrivalTime ||
      !stop.departureTime ||
      isNaN(stop.distanceFromSource) ||
      isNaN(stop.stationsOrder)
    ) {
      const error = new Error(
        'Each stop must have station, arrivalTime, departureTime, distanceFromSource, and stationsOrder'
      );
      error.status = 400;
      return next(error);
    }
    if (
      typeof stop.station === 'string' &&
      !mongoose.Types.ObjectId.isValid(stop.station)
    ) {
      const stationDoc = await Station.findOne({
        name: stop.station.toLowerCase(),
      });
      if (!stationDoc) {
        const error = new Error(`Station does not exist: ${stop.station}`);
        error.status = 404;
        return next(error);
      }
      stop.station = stationDoc._id;
    }
    if (
      isNaN(Date.parse(stop.arrivalTime)) ||
      isNaN(Date.parse(stop.departureTime))
    ) {
      const error = new Error(
        'Each stop arrivalTime and departureTime must be valid ISO date strings'
      );
      error.status = 400;
      return next(error);
    }
    // Check that arrivalTime is before departureTime for each stop
    if (new Date(stop.arrivalTime) >= new Date(stop.departureTime)) {
      const error = new Error(
        'Each stop arrivalTime must be before departureTime'
      );
      error.status = 400;
      return next(error);
    }
  }
  if (isNaN(Date.parse(date))) {
    const error = new Error('date is not valid');
    error.status = 400;
    return next(error);
  }
  if (!mongoose.Types.ObjectId.isValid(trainId)) {
    const error = new Error('trainId is not valid');
    error.status = 400;
    return next(error);
  }
  // Check that mainDepartureTime is before mainArrivalTime
  if (new Date(mainDepartureTime) >= new Date(mainArrivalTime)) {
    const error = new Error('mainDepartureTime must be before mainArrivalTime');
    error.status = 400;
    return next(error);
  }
  // Check if the train runs on the requested date
  try {
    const train = await Train.findById(trainId);
    if (!train) {
      const error = new Error('Train not found');
      error.status = 404;
      return next(error);
    }
    // Check runningDays if present on train
    if (train.runningDays && Array.isArray(train.runningDays)) {
      const scheduleDay = new Date(date)
        .toLocaleString('en-US', { weekday: 'long' })
        .toLowerCase();
      const allowedDays = train.runningDays.map((day) => day.toLowerCase());
      if (!allowedDays.includes(scheduleDay)) {
        const error = new Error(
          `Cannot create schedule on this date. Train only runs on: ${train.runningDays.join(
            ', '
          )}`
        );
        error.status = 400;
        return next(error);
      }
    }
    const existingSchedule = await TrainSchedule.findOne({
      train: trainId,
      date: new Date(date),
    });
    if (existingSchedule) {
      const error = new Error(
        'Schedule already exists for this train and date'
      );
      error.status = 409;
      return next(error);
    }
    next();
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong in schedule middleware'
    );
    error.status = 400;
    return next(error);
  }
};

// agent development kit
// design architecture diagram
