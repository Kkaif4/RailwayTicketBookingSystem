import express from 'express';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import TrainRouteRoutes from './routes/trainRouteRoutes.js';
import TrainRoute from './routes/trainRoutes.js';
import authRoutes from './routes/authRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//auth routes
app.use('/api', authRoutes);

//stations routes
app.use('/api/stations', stationRoutes);

//trainRoute routes
app.use('/api/trains/routes', TrainRouteRoutes);

// train routes
app.use('/api/trains', TrainRoute);

//ticket routes
app.use('/tickets', ticketRoutes);

//root api
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
