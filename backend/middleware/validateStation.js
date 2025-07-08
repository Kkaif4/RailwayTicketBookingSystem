export const validateStationInput = (req, res, next) => {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.status(400).json({
      message: "name and code are required",
      success: false,
    });
  }

  if (typeof name !== "string" || typeof code !== "string") {
    //if name and code arent string
    return res.status(400).json({
      message: "name and code must be strings",
      success: false,
    });
  }

  next();
};
