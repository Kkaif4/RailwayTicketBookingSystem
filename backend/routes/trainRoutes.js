import express from 'express';
import { addTrain, getAllTrains } from '../controller/trainController.js';
import { checkAddTrain } from '../middleware/bodyHandler.js';

const router = express.Router();

router.get('/getTrains', getAllTrains);
router.post('/addTrain', checkAddTrain, addTrain);

export default router;
