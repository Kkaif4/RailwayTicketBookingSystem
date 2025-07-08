import express from "express";
import {
  getStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
} from "../controller/stationController.js";
import { validateStationInput } from "../middleware/validateStation.js";


const router = express.Router();

router.post("/", validateStationInput, createStation); // create a station
router.get("/", getStations); // get all stations
router.get("/:id", getStationById); // get station by id
router.put("/:id", validateStationInput, updateStation); // update a station
router.delete("/:id", deleteStation); // delete a station

export default router;
