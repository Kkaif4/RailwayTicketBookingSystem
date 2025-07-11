import Train from '../models/Train.Model.js';
import TrainSchedule from '../models/TrainSchedule.Model.js';
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
  const { trainId, date, departureTime, arrivalTime, stops } = req.body;
  try {
    // Fetch the train to get totalSeats
    const train = await Train.findById(trainId);
    const addSeats = stops.map((stop) => ({
      ...stop,
      availableSeats: train.totalSeats,
    }));
    const schedule = new TrainSchedule({
      train: trainId,
      date: new Date(date),
      departureTime,
      arrivalTime,
      stops: addSeats,
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
