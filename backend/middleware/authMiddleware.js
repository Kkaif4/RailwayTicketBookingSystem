import jwt from 'jsonwebtoken';
import User from '../models/User.Model';

export const tokenVerification = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const isUserValid = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById({ _id: id });
  if (!user) {
    const error = new Error('user not found');
    error.status = 400;
    return next(error);
  }
  
  next();
};

