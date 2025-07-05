import TrainRoutes from '../models/TrainSchedule.Model';

//create route
// @body - list of stations with A/D time, order of stations
export const setRoutes = async (req, res, next) => {
  const { stations } = req.body;
  if (!stations || !Array.isArray(stations) || stations.length < 2) {
    return res
      .status(400)
      .json({ message: 'At least two stations are required' });
  }
};

//get Routes - route id
export const getAllRoutes = async () => {};
