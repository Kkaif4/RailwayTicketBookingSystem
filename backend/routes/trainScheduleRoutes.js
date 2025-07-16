import express from 'express';
import {
  createSchedule,
  deleteSchedule,
  getAllSchedule,
  getSchedule,
} from '../controller/trainScheduleController.js';
import {
  validateStops,
  validateTrainAndTime,
} from '../middleware/bodyHandler.js';
const router = express.Router();

router.get('/get-schedules', getAllSchedule);
router.get('/get-schedule/:trainId', getSchedule);
router.post(
  '/create-schedule',
  validateTrainAndTime,
  validateStops,
  createSchedule
);
router.delete('/delete', deleteSchedule);
export default router;
