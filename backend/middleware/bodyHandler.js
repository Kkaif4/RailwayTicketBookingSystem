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
    typeof trainName !== 'string' ||
    trainName.trim() === '' ||
    typeof source !== 'string' ||
    source.trim() === '' ||
    typeof destination !== 'string' ||
    destination.trim() === ''
  ) {
    const error = new Error('hello Data is invalid');
    error.status = 400;
    return next(error);
  }
  const A = new Date(arrival);
  const D = new Date(departure);
  if (!(A instanceof Date) || !(D instanceof Date)) {
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
