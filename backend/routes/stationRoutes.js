import express from "express";
import {
  getStations,
  getStationById,
  createStation,
  updateStation,
<<<<<<< HEAD
<<<<<<< HEAD
} from '../controller/stationController.js';
=======
} from "../controller/stationController.js";
>>>>>>> e1b5e793f190008fca34d7bb38a514afc1bab0fb
=======
  deleteStation,
} from "../controllers/stationController.js";
import { validateStationInput } from "../middleware/validateStation.js";
>>>>>>> 4c2276e004b312589f4f93c207ffdf0396395716

const router = express.Router();

router.post("/", validateStationInput, createStation); // create a station
router.get("/", getStations); // get all stations
router.get("/:id", getStationById); // get station by id
router.put("/:id", validateStationInput, updateStation); // update a station
router.delete("/:id", deleteStation); // delete a station

export default router;
