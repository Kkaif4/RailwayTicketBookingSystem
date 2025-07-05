export const checkAddTrain = (req, res, next) => {
  const { trainName, source, destination, arrival, departure, totalSeats } =
    req.body;
  if (
    !trainName ||
    !source ||
    !destination ||
    !arrival ||
    !departure ||
    !totalSeats
  ) {
    const error = new Error('Data is invalid');
    error.status = 400;
    return next(error);
  }
  if (
    trainName !== typeof 'string' ||
    trainName.trim() === '' ||
    source !== typeof 'string' ||
    source.trim() === '' ||
    destination !== typeof 'string' ||
    destination.trim() === ''
  ) {
    const error = new Error('Data is invalid');
    error.status = 400;
    return next(error);
  }
  if (!isDate(arrival) || !isDate(departure)) {
    const error = new Error('time is not valid');
    error.status = 400;
    return next(error);
  }
  if (isNaN(totalSeats)) {
    const error = new Error('seats are not valid');
    error.status = 400;
    return next(error);
  }
  next();
};
