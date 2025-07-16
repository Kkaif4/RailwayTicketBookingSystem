import Train from '../models/Train.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';
import Station from '../models/Station.Model.js';
import mongoose from 'mongoose';

import { DateTime } from 'luxon';

export const checkAddTrain = async (req, res, next) => {
  const { trainName, totalSeats, source, destination } = req.body;
  if (!trainName || !source || !destination) {
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

  next();
};

export const validateStops = async (req, res, next) => {
  try {
    const { date, stops } = req.body;

    if (!stops || !Array.isArray(stops) || stops.length === 0) {
      const error = new Error('Missing required fields stops');
      error.status = 400;
      return next(error);
    }

    let lastDeparture = null;
    let lastArrival = null;
    const stationSet = new Set();
    let expectedOrder = 1;
    req.stopsArray = [];

    for (let stop of stops) {
      let {
        station,
        arrivalTime,
        departureTime,
        distanceFromSource,
        stationsOrder,
      } = stop;

      if (!station || isNaN(distanceFromSource) || isNaN(stationsOrder)) {
        const error = new Error(
          'Each stop must have station, distanceFromSource, timeFromSourceInMinutes, and stationsOrder'
        );
        error.status = 400;
        return next(error);
      }

      if (typeof station !== 'string') {
        const error = new Error(`invalid station name ${station}.`);
        error.status = 400;
        return next(error);
      }
      const stationExist = await Station.findOne({
        name: station.toLowerCase(),
      });
      stop.station = stationExist._id;

      if (!stationExist) {
        const error = new Error(`Station "${station}" does not exist`);
        error.status = 404;
        return next(error);
      }
      if (stationSet.has(station)) {
        const error = new Error(`Duplicate station ${station} in stops.`);
        error.status = 400;
        return next(error);
      }
      stationSet.add(station);
      if (isNaN(stationsOrder) || stationsOrder !== expectedOrder) {
        const error = new Error(
          `stationsOrder must be a positive integer and strictly increasing for ${station}`
        );
        error.status = 400;
        return next(error);
      }
      expectedOrder++;
      const arrivalDate = new Date(arrivalTime);
      const departureDate = new Date(departureTime);
      if (isNaN(arrivalDate.getTime()) || isNaN(departureDate.getTime())) {
        const error = new Error(
          `Invalid arrivalTime or departureTime at station "${station}"`
        );
        error.status = 400;
        return next(error);
      }

      if (arrivalDate < new Date(date) || departureDate < new Date(date)) {
        const error = new Error(
          `Invalid arrivalTime or departureTime at station ${station}`
        );
        error.status = 400;
        return next(error);
      }
      if (lastArrival && arrivalDate <= lastArrival) {
        const error = new Error(
          `Each stop's arrivalTime must be greater than the previous stop's arrivalTime ${station}`
        );
        error.status = 400;
        return next(error);
      }
      if (lastDeparture && departureDate <= lastDeparture) {
        const error = new Error(
          `Each stop's departureTime must be greater than the previous stop's departureTime ${stop.station}`
        );
        error.status = 400;
        return next(error);
      }
      if (departureDate <= arrivalDate) {
        const error = new Error(
          `departureTime must be greater than or equal to arrivalTime for ${station}`
        );
        error.status = 400;
        return next(error);
      }

      lastArrival = arrivalDate;
      lastDeparture = departureDate;
      req.stopsArray.push(stop);
    }
    console.log('ho gaya');
    next();
    // res.json({ message: 'done' });
  } catch (err) {
    const error = new Error(err.message || 'Error validating stops');
    error.status = 400;
    return next(error);
  }
};

export const validateTrainAndTime = async (req, res, next) => {
  try {
    const { date, trainId, startTime, endTime, timezone = 'UTC' } = req.body;

    if (!mongoose.isValidObjectId(trainId)) {
      const error = new Error('TrainId is not valid.');
      error.status = 201;
      return next(error);
    }

    const train = await Train.findOne({ _id: trainId });
    if (!train) {
      const error = new Error('Train does not found for this TrainId.');
      error.status = 400;
      return next(error);
    }
    req.train = train;
    if (!date) {
      const error = new Error('Date is missing.');
      error.status = 400;
      return next(error);
    }
    const ND = new Date(date);

    if (isNaN(ND.getTime()) || ND < Date.now()) {
      const error = new Error('Date is not valid.');
      error.status = 400;
      return next(error);
    }

    const oneWeek = new Date();
    oneWeek.setDate(oneWeek.getDate() + 6);

    if (ND > oneWeek) {
      const error = new Error('cannot create schedule beyond 1 week.');
      error.status = 400;
      return next(error);
    }

    if (!startTime || !endTime) {
      const error = new Error('Start or End time is missing.');
      error.status = 400;
      return next(error);
    }

    const start = DateTime.fromISO(startTime, { zone: timezone });
    const end = DateTime.fromISO(endTime, { zone: timezone });

    if (!start.isValid || !end.isValid) {
      const error = new Error('Start or End time is not valid.');
      error.status = 400;
      return next(error);
    }
    if (start >= end) {
      const error = new Error('Start time must be before End time.');
      error.status = 400;
      return next(error);
    }
    const schedules = await TrainSchedule.find({
      train: trainId,
      date: ND,
      $or: [
        {
          startTime: { $lt: end.toUTC().toJSDate() },
          endTime: { $gt: start.toUTC().toJSDate() },
        },
      ],
    });
    if (schedules && schedules.length > 0) {
      const error = new Error(
        'Schedule already exist for this time and train.'
      );
      error.status = 400;
      return next(error);
    }

    next();
  } catch (err) {
    const error = new Error(
      err.message || 'Error validating schedule date and overlap'
    );
    error.status = 400;
    return next(error);
  }
};

export const validateDate = async (req, res, next) => {
  try {
  } catch (err) {}
};

// agent development kit
// design architecture diagram
