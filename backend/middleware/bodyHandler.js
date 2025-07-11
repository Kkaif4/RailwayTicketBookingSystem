import Train from '../models/Train.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';
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
  try {
    const { trainId, stops } = req.body;

    if (!trainId || !stops || !Array.isArray(stops) || stops.length === 0) {
      const error = new Error('Missing required fields: trainId or stops');
      error.status = 400;
      return next(error);
    }

    // Validate train existence
    const train = await Train.findById(trainId);
    if (!train) {
      const error = new Error('Train does not exist');
      error.status = 404;
      return next(error);
    }

    const scheduleFound = await TrainSchedule.findOne({
      train: trainId,
      date,
    });

    if (scheduleFound) {
      const error = new Error(
        'Schedule already exists for this train. Please update the existing schedule.'
      );
      error.status = 400;
      return next(error);
    }

    let lastOrder = 0;
    let lastArrival = null;
    let lastDeparture = null;
    for (const stop of stops) {
      if (
        !stop.station ||
        isNaN(stop.distanceFromSource) ||
        isNaN(stop.stationsOrder)
      ) {
        const error = new Error(
          'Each stop must have station, distanceFromSource, timeFromSourceInMinutes, and stationsOrder'
        );
        error.status = 400;
        return next(error);
      }
      // If station is a string, resolve to ObjectId
      if (typeof stop.station === 'string' && stop.station.length !== 24) {
        const stationDoc = await Station.findOne({ name: stop.station });
        if (!stationDoc) {
          const error = new Error(`Station "${stop.station}" does not exist`);
          error.status = 404;
          return next(error);
        }
        stop.station = stationDoc._id;
      }

      if (
        isNaN(stop.stationsOrder) ||
        stop.stationsOrder <= 0 ||
        stop.stationsOrder <= lastOrder
      ) {
        const error = new Error(
          'stationsOrder must be a positive integer and strictly increasing for each stop'
        );
        error.status = 400;
        return next(error);
      }
      lastOrder = stop.stationsOrder;
      if (
        typeof stop.arrivalTime !== 'string' ||
        stop.arrivalTime.trim() === '' ||
        isNaN(Date.parse(stop.arrivalTime)) ||
        typeof stop.departureTime !== 'string' ||
        stop.departureTime.trim() === '' ||
        isNaN(Date.parse(stop.departureTime))
      ) {
        const error = new Error(
          'Each stop must have valid ISO arrivalTime and departureTime strings'
        );
        error.status = 400;
        return next(error);
      }

      const arrivalDate = new Date(stop.arrivalTime);
      const departureDate = new Date(stop.departureTime);

      if (lastArrival && arrivalDate <= lastArrival) {
        const error = new Error(
          "Each stop's arrivalTime must be greater than the previous stop's arrivalTime"
        );
        error.status = 400;
        return next(error);
      }
      if (lastDeparture && departureDate <= lastDeparture) {
        const error = new Error(
          "Each stop's departureTime must be greater than the previous stop's departureTime"
        );
        error.status = 400;
        return next(error);
      }
      if (departureDate < arrivalDate) {
        const error = new Error(
          'departureTime must be greater than or equal to arrivalTime at each stop'
        );
        error.status = 400;
        return next(error);
      }

      lastArrival = arrivalDate;
      lastDeparture = departureDate;
    }
    req.train = train;
    next();
  } catch (err) {
    const error = new Error(err.message || 'Error validating schedule');
    error.status = 400;
    return next(error);
  }
};

export const validateScheduleDateAndOverlap = async (req, res, next) => {
  try {
    const { trainId, date, mainDepartureTime, mainArrivalTime } = req.body;
    console.log('hello');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0);

    if (scheduleDate < today) {
      const error = new Error('Cannot create schedule for a past date.');
      error.status = 400;
      return next(error);
    }

    const depDateTime = new Date(mainDepartureTime);
    const arrDateTime = new Date(mainArrivalTime);

    const overlappingSchedule = await TrainSchedule.findOne({
      train: trainId,
      $or: [
        {
          mainDepartureTime: { $lte: depDateTime },
          mainArrivalTime: { $gte: depDateTime },
        },
        {
          mainDepartureTime: { $lte: arrDateTime },
          mainArrivalTime: { $gte: arrDateTime },
        },
        {
          mainDepartureTime: { $gte: depDateTime },
          mainArrivalTime: { $lte: arrDateTime },
        },
      ],
    });

    if (overlappingSchedule) {
      const error = new Error(
        'Schedule overlaps with an existing schedule for this train.'
      );
      error.status = 409;
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

// agent development kit
// design architecture diagram
