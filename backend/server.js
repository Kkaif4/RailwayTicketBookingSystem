import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import stationRoutes from "./routes/stationRoutes.js";

dotenv.config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI); //jst to ckeck if .env loaded here in process or not

const app = express();
app.use(express.json());

//connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(console.log("mongoDB connected"))
  .catch((err) => console.log(err));

//Routes
app.use("/api/stations", stationRoutes);

//start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});
