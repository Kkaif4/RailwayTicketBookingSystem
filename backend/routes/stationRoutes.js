import express from "express";
import {
  createStation,
  deleteStation,
  getStationById,
  getStations,
  updateStation,
<<<<<<< HEAD
} from '../controller/stationController.js';
=======
} from "../controller/stationController.js";
>>>>>>> e1b5e793f190008fca34d7bb38a514afc1bab0fb

const router = express.Router();
router.post("/", createStation); //create a station
router.get("/", getStations); //get all stations
router.get("/:id", getStationById); //get station by id
router.put("/:id", updateStation); //update a station
router.delete("/:id", deleteStation); //delete a station

export default router;
