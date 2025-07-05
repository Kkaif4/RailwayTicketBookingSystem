import mongoose from "mongoose";
import Station from "../models/stationModel.js";

//create a station
export const createStation = async (req, res) => {
  try {
    const { name, code } = req.body;

    const existing = await Station.findOne({ $or: [({ name }, { code })] });
    if (existing) {
      res.status(400).json({ message: "Station already exists" });
    }
    const station = await Station.create({ name, code });
    res.status(201).json(station);
  } catch (err) {
    res.status(500), json({ message: err.message });
  }
};

//get all stations
export const getStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get single station by id

export const getStationById = async (req, res) => {
  try {
    //validate mongodb object id (as per mongodb id format)
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "invalid sattion id" });
    }
    //get station id from url
    const station = await Station.findById(req.params.id);

    //if the station with req id isnt found
    if (!station) {
      res.status(404).json({ message: "Station with this id is not found" });
    }
    //if found ,return the station
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//update a station
export const updateStation = async (req, res) => {
  try {
    const { name, code } = req.body;
    const station = await Station.findByIdAndUpdate(
      //it returns the updated document,after searching the id from params and puting re.body data there
      req.params.id,
      { name, code },
      { new: true }
    );
    if (!station) {
      //if findByIdAndUpdate returned null(due to user provided id not found in Station)
      res.status(404).json({ message: "Station not found" });
    }
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//delete a station
export const deleteStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) {
      res.status(404).json({ message: "Station Not Found or already deleted" });
    }
    res.json({ message: "Station deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
