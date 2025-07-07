export const checkAddTrain = (req, res, next) => {
  const {
    trainName,
    source,
    destination,
    arrival,
    departure,
    runningDays,
    totalSeats,
  } = req.body;
  if (
    !trainName ||
    !source ||
    !destination ||
    !arrival ||
    !departure ||
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

  const days = [
    'monday',
    'sunday',
    'wednesday',
    'tuesday',
    'thursday',
    'friday',
    'saturday',
  ];
  for (let RD of runningDays) {
    if (typeof RD !== 'string') {
      const error = new Error('running days are not valid');
      error.status = 400;
      return next(error);
    }
    if (!days.includes(RD.toLowerCase())) {
      console.log(RD);
      const error = new Error('running day is not valid');
      error.status = 400;
      return next(error);
    }
  }
  if (isNaN(totalSeats)) {
    const error = new Error('seats are not valid');
    error.status = 400;
    return next(error);
  }
  next();
};

export const checkAddRoute = (req, res, next) => {
  const { stationArray } = req.body;
  if (!stationArray) {
    const error = new Error('stations are not valid');
    error.status = 400;
    return next(error);
  }
  // const station = stationArray.map((s) => {
  //   if (typeof s !== 'object') {
  //     const error = new Error('wrong input in stations array');
  //     error.status = 400;
  //     return next(error);
  //   }
  // });
  next();
};
