import Train from '../models/Train.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';

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
    if (!train) {
      const error = new Error('train not found');
      error.status = 201;
      return next(error);
    }
    res.json({ message: 'Schedule created', success: true });
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong in create schedule'
    );
    error.status = 400;
    return next(error);
  }
};