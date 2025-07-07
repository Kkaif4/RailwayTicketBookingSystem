import express from 'express';
import {
  createSchedule,
  getSchedule,
} from '../controller/trainScheduleController.js';
const router = express.Router();

router.get('/get-all-schedule/:trainId', getSchedule);
router.post('/create-schedule', createSchedule);
export default router;
