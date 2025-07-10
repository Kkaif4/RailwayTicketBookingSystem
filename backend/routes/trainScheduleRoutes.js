import express from 'express';
import {
  createSchedule,
  deleteSchedule,
  getSchedule,
} from '../controller/trainScheduleController.js';
import { scheduleCheck } from '../middleware/bodyHandler.js';
const router = express.Router();

router.get('/get-all-schedule/:trainId', getSchedule);
router.post('/create-schedule', scheduleCheck, createSchedule);
router.delete('/delete', deleteSchedule);
export default router;
