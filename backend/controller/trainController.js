import Train from "../models/Train.Model.js";
import Station from "../models/Station.Model.js";
import TrainRoutes from "../models/TrainRoute.Model.js";
import Seat from "../models/Seat.Model.js";

// @params - train name, id, source, destination, time for D/A, seat no.
export const addTrain = async (req, res, next) => {
  const { trainName, source, destination, arrival, departure, totalSeats } =
    req.body;

  // checking if there is already train for the provided source and destination
  const train = await Train.findOne({
    trainName,
    mainSource: source,
    mainDest: destination,
  });

  // if found the existing train then return
  if (train) {
    console.log(train);
    const error = new Error("Train already exist");
    error.status = 400;
    return next(error);
  }
  try {
    const sourceStation = await Station.findOne({ name: source });
    const destStation = await Station.findOne({ name: destination });

    if (!sourceStation || !destStation) {
      const error = new Error("Invalid source or destination station name");
      error.status = 400;
      return next(error);
    }

    //checking if routes available or not
    const routes = await TrainRoutes.find().populate("stops.station");
    if (!routes || !routes.length) {
      const error = new Error("Route not found");
      error.status = 400;
      return next(error);
    }

    //finding matched routes for source and destination
    const matchedRoute = routes.find((route) => {
      const orderedStops = [...route.stops].sort(
        (a, b) => a.stationsOrder - b.stationsOrder
      );
      const firstStop = orderedStops[0];
      const lastStop = orderedStops[orderedStops.length - 1];
      if (
        firstStop.station.name === source &&
        lastStop.station.name === destination
      ) {
        return true;
      }
      return false;
    });

    //check is we found the matched routes
    if (!matchedRoute) {
      const error = new Error(
        "Route not found for this source and destination stations"
      );
      error.status = 400;
      return next(error);
    }

    //creating new object for new train
    const newTrain = {
      trainNumber:
        source.charAt(0).toUpperCase() +
        destination.charAt(0).toUpperCase() +
        "-" +
        Math.floor(Math.random() * 1000),
      trainName,
      mainSource: source,
      mainDest: destination,
      sourceDepartureTime: departure,
      destArrivalTime: arrival,
      totalSeats,
      route: matchedRoute._id,
    };

    //saving train into db
    const one = await Train.create(newTrain);
    matchedRoute.availableSeats = totalSeats;
    await matchedRoute.save();
    // creating seats array and putting seats into Seats model
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push({
        train: one._id,
        seatNumber:
          source.charAt(0) + destination.charAt(0) + "-seat-" + i.toString(),
      });
    }
    await Seat.insertMany(seats);

    //sending response
    res.json({
      message: "train created",
      data: one.trainName,
      success: true,
    });
  } catch (err) {
    const error = new Error(
      err.message || "Internal server error in adding train"
    );
    error.status = 500;
    return next(error);
  }
};

//getting all trains
export const getAllTrains = async (req, res, next) => {
  try {
    const trains = await Train.find().populate("routes");
    if (!trains || trains.length === 0) {
      const error = new Error("trains not found");
      error.status = 201;
      return next(error);
    }
    res.json({ data: trains, success: true });
  } catch (err) {
    const error = new Error(
      err.message || "internal server error getting trains"
    );
    error.status = 400;
    return next(error);
  }
};

export const getTrainById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const train = await Train.findById({ _id: id });
    if (!train) {
      const error = new Error("trains not found for this id");
      error.status = 201;
      return next(error);
    }
    const seats = await Seat.find({ train: train._id });
    res.json({
      message: "train found",
      data: train,
      seats: seats,
      success: true,
    });
  } catch (err) {
    const error = new Error(err.message || "Error finding train by id");
    error.status = 400;
    return next(error);
  }
};

export const getSearchTrain = async (req, res, next) => {
  const { source, destination } = req.query;

  const sourceStaion = await Station.findOne({ name: source });
  const destiantionStation = await Station.findOne({ name: destination });
  const sourceId = sourceStaion._id;
  const destinationId = destiantionStation._id;

  const matchingRoutes = await TrainRoutes.find({
    "stops.station": { $all: [sourceId, destinationId] },
  }).populate("stops.station");
  console.log(matchingRoutes);
  const validRoutes = matchingRoutes.filter((route) => {
    const stops = route.stops;

    const sourceStop = stops.find((stop) => stop.station._id.equals(sourceId));
    const destStop = stops.find((stop) =>
      stop.station._id.equals(destinationId)
    );
    if (!sourceStop || !destStop) return false;

    return sourceStop.stationsOrder < destStop.stationsOrder;
  });
  // console.log(validRoutes);
  console.log(validRoutes[0]._id);
  const train = await Train.findOne({ route: validRoutes[0]._id });
  console.log(train);
  res.json({ message: "heeelo", data: train });
};

//add route to train with routes id and train id
export const addRouteToTrain = async () => {};
