import express from 'express';
import {
  createStation,
  deleteStation,
  getStationById,
  getStations,
  updateStation,
} from '../controller/stationController.js';

const router = express.Router();

router.post('/', createStation); //create a station
router.get('/', getStations); //get all stations
router.get('/:id', getStationById); //get station by id
router.put('/:id', updateStation); //update a station
router.delete('/:id', deleteStation); //delete a station

export default router;
