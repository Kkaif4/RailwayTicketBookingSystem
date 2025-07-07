export const validateStationInput = (req, res, next) => {
  const { stationName, code } = req.body;

  if (!stationName || !code) {
    return res
      .status(400)
      .json({ message: "stationnName and code are required" });
  }
  next();
};
