import mongoose from "mongoose";
import Station from "../models/Station.Model.js";

// Create a station
export const createStation = async (req, res, next) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      const error = new Error("Station name and code are required");
      error.status = 400;
      return next(error);
    }

    const existing = await Station.findOne({
      $or: [{ name }, { code }],
    });

    if (existing) {
      const error = new Error("Station already exists");
      error.status = 400;
      return next(error);
    }

    const station = await Station.create({ name, code });
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
    console.log("hello");
    const { search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    console.log(query);

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
    console.log(stations);

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
    const { name, code } = req.body;

    // Check for valid ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid station ID");
      error.status = 400;
      return next(error);
    }

    // validate request body
    if (!name || !code) {
      const error = new Error("Station name and code are required");
      error.status = 400;
      return next(error);
    }

    const updated = await Station.findByIdAndUpdate(
      id,
      { name, code },
      { new: true }
    );

    if (!updated) {
      const error = new Error("Station not found");
      error.status = 404;
      return next(error);
    }

    res.json({ success: true, data: updated });
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
