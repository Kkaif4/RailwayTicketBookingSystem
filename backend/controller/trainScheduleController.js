import Train from '../models/Train.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';
import Station from '../models/Station.Model.js';
import { DateTime } from 'luxon';
export const getAllSchedule = async (req, res, next) => {
  try {
    const schedules = await TrainSchedule.find({});
    if (!schedules || schedules.length === 0) {
      const error = new Error('No Schedule found');
      error.status = 201;
      return next(error);
    }
    res.json({ message: 'schedule found', data: schedules, success: true });
  } catch (err) {
    const error = new Error(
      err.message || 'something wrong in the getAllSchedule'
    );
    error.status = 400;
    return next(error);
  }
};

export const getSchedule = async (req, res, next) => {
  const { id } = req.params;
  try {
    const schedule = await TrainSchedule.findOne({ _id: id }).populate(
      'train route'
    );
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

export const createSchedule = async (req, res, next) => {
  const { startTime, endTime, date, timezone } = req.body;
  const train = req.train;
  const stops = req.stopsArray;
  try {
    const stopsWithSeats = stops.map((stop) => ({
      ...stop,
      availableSeats: train.totalSeats,
    }));
    const startUTC = DateTime.fromISO(startTime, { zone: timezone })
      .toUTC()
      .toJSDate();
    const endUTC = DateTime.fromISO(endTime, { zone: timezone })
      .toUTC()
      .toJSDate();
    const schedule = new TrainSchedule({
      train: train._id,
      date: new Date(date),
      startTime: startUTC,
      endTime: endUTC,
      stops: stopsWithSeats,
      status: 'scheduled',
    });
    await schedule.save();
    res.json({ message: 'Schedule created', data: schedule, success: true });
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong in create schedule'
    );
    error.status = 400;
    return next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  const today = Date.now();
  const deletedDate = new Date(today);
  try {
    const result = await TrainSchedule.deleteMany({
      date: { $lt: deletedDate },
    });
    if (result.deletedCount === 0) {
      const error = new Error('No old schedules found to delete');
      error.status = 404;
      return next(error);
    }
    res.json({
      message: `${result.deletedCount} old schedules deleted successfully`,
      success: true,
    });
  } catch (err) {
    const error = new Error(
      err.message || 'something went wrong in delete schedule'
    );
    error.status = 400;
    return next(error);
  }
};
