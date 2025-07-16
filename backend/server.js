import express from 'express';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import TrainRoute from './routes/trainRoutes.js';
import TrainSchedule from './routes/trainScheduleRoutes.js';
import authRoutes from './routes/authRoutes.js';
import stationRoutes from './routes/stationRoutes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//auth routes
app.use('/api', authRoutes);

//stations routes
app.use('/api/stations', stationRoutes);

// train routes
app.use('/api/trains', TrainRoute);

//schedule
app.use('/api/schedule', TrainSchedule);

//root api
app.get('/', (req, res) => {
  res.json({ message: 'root API hit, Hi' });
});

app.get('/', (req, res) => {
  res.json({ message: 'root API hit, Hi' });
});

//page not found
app.use((req, res, next) => {
  const error = new Error('Page not found');
  error.status = 404;
  return next(error);
});

//error handler
app.use(errorHandler);

//listening to port
app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`server is listening on port ${process.env.PORT}`);
});


// same train on difference timing and days
// train should be flexible and not bounded by schedule
// getTime - research. with time zone
// get time,day,week -
// test cases - 
// race condition - transition
// nest js - class validator, class transformer, id validation
