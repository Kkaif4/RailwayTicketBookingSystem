export const trainSearchQuery = (req, res, next) => {
  const {
    source = 'latur',
    destination = 'pune',
    date = new Date(Date.now() + 24 * 60 * 60 * 1000),
  } = req.query;
  
};
