import express from 'express';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'root API hit, Hi' });
});

app.use((req, res, next) => {
  const error = new Error('Page not found');
  error.status = 404;
  return next(error);
});

app.use(errorHandler);
app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`server is listening on port ${process.env.PORT}`);
});
