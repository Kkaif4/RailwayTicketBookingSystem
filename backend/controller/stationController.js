import mongoose from "mongoose";
import Station from "../models/Station.Model.js";

// Create a station
export const createStation = async (req, res, next) => {
  try {
    const { stationName, code } = req.body;

    if (!stationName || !code) {
      const error = new Error("Station name and code are required");
      error.status = 400;
      return next(error);
    }

    const existing = await Station.findOne({
      $or: [{ stationName }, { code }],
    });

    if (existing) {
      const error = new Error("Station already exists");
      error.status = 400;
      return next(error);
    }

    const station = await Station.create({ stationName, code });
    res.status(201).json({ success: true, data: station });
  } catch (err) {
    next(err);
  }
};

// @desc    Fetch all stations
//          Supports (optional) search by station name and pagination
// @route   GET /stations
// @query   ?search=string&page=number&limit=number
export const getStations = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.stationName = { $regex: search, $options: "i" };
    }

    const totalStations = await Station.countDocuments(query);
    const totalPages = Math.ceil(totalStations / limit);
    const currentPage = Number(page);

    if (currentPage < 1 || currentPage > totalPages) {
      const error = new Error("Invalid page or limit number");
      error.status = 400;
      return next(error);
    }

    const stations = await Station.find(query)
      .skip((currentPage - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      totalStations,
      totalPages,
      currentPage,
      data: stations,
    });
  } catch (err) {
    next(err);
  }
};

// Get single station by ID
export const getStationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid station ID");
      error.status = 400;
      return next(error);
    }

    const station = await Station.findById(id);

    if (!station) {
      const error = new Error("Station not found");
      error.status = 404;
      return next(error);
    }

    res.json({ success: true, data: station });
  } catch (err) {
    next(err);
  }
};

// Update a station
export const updateStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stationName, code } = req.body;

    if (!stationName || !code) {
      const error = new Error("Station name and code are required");
      error.status = 400;
      return next(error);
    }

    const station = await Station.findByIdAndUpdate(
      id,
      { stationName, code },
      { new: true }
    );

    if (!station) {
      const error = new Error("Station not found");
      error.status = 404;
      return next(error);
    }

    res.json({ success: true, data: station });
  } catch (err) {
    next(err);
  }
};

// Delete a station
export const deleteStation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const station = await Station.findByIdAndDelete(id);

    if (!station) {
      const error = new Error("Station not found or already deleted");
      error.status = 404;
      return next(error);
    }

    res.json({ success: true, message: "Station deleted successfully" });
  } catch (err) {
    next(err);
  }
};
