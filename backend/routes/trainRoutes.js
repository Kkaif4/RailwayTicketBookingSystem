import express from "express";
import {
  addTrain,
  getAllTrains,
  getTrainById,
  getSearchTrain,
} from "../controller/trainController.js";
import { checkAddTrain } from "../middleware/bodyHandler.js";

const router = express.Router();

router.get("/getTrains", getAllTrains);
//search route
router.get("/search", getSearchTrain);
router.get("/getTrains/:id", getTrainById);
router.post("/addTrain", checkAddTrain, addTrain);

export default router;
