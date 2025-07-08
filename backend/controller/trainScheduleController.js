import Train from '../models/Train.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';
import TrainRoute from '../models/TrainRoute.Model.js';
import Station from '../models/Station.Model.js';
export const getSchedule = async (req, res, next) => {
  const { id } = req.params;
  try {
    const schedule = await TrainSchedule.findOne({ _id: id });
    if (!schedule) {
      const error = new Error('schedule not found for this id');
      error.status = 201;
      return next(error);
    }
    res.json({ message: 'schedule found', data: schedule, success: true });
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong getting schedule'
    );
    error.status = 400;
    return next(error);
  }
};

//! still in edit
export const createSchedule = async (req, res, next) => {
  const { trainId, date } = req.body;
  try {
    const train = await Train.findOne({ _id: trainId }).populate('route');
    // console.log(train);
    if (!train) {
      const error = new Error('train not found');
      error.status = 201;
      return next(error);
    }
    const newSchedule = await TrainSchedule.create({ date, train: trainId });
    const route = train.route;
    await route.populate('stops.station');
    const path = route.stops;
    let stops = [];
    path.forEach((stop) => {
      stops.push(stop.station.name);
    });
    console.log(stops);
    const data = {
      schedule: newSchedule,
      Train_Name: train.trainName,
      path: stops,
    };
    res.json({ message: 'Schedule created', data, success: true });
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong in create schedule'
    );
    error.status = 400;
    return next(error);
  }
};
