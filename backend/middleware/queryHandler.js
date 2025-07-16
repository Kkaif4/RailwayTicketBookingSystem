export const trainSearchQuery = (req, res, next) => {
  const { source, destination, date } = req.query;
  try {
    if (!source || !destination) {
      const error = new Error('query is not valid ');
      error.status = 201;
      return next(error);
    }
    if (date) {
      if (typeof date !== 'string') {
        const error = new Error('date is not valid ');
        error.status = 201;
        return next(error);
      }
      const now = new Date(date);
      console.log(now);
      if (!now || typeof now === 'Invalid Data') {
        const error = new Error('date is not valid ');
        error.status = 201;
        return next(error);
      }
      if (now < Date.now()) {
        const error = new Error('date is not valid ');
        error.status = 201;
        return next(error);
      }
      req.userQueryDate = now;
    }
    if (typeof source !== 'string' || typeof destination !== 'string') {
      const error = new Error('query is not valid ');
      error.status = 201;
      return next(error);
    }
    next();
  } catch (err) {
    const error = new Error(err.message || 'query is not valid ');
    error.status = 400;
    return next(error);
  }
};