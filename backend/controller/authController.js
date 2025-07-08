import User from '../models/User.Model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Create user.....

export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const usernameRegex = /^(?=.*[A-Z])(?=.*[0-9]).{5,}$/;
    if (!usernameRegex.test(username)) {
      return next(
        new Error(
          'Username must have one capital letter, one number, and be at least 5 characters long'
        )
      );
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(new Error('User already exists'));
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return next(
        new Error(
          'Password must have one capital letter, one special character, one number, and be at least 6 characters long'
        )
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.status(201).json({ msg: 'Register successful', token });
  } catch (err) {
    next(err);
  }
};

// Login user....

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return next(new Error('Invalid username or password.'));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new Error('Invalid username or password.'));
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    next(err);
  }
};

// Update user.....

export const updateUser = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new Error('User not found.'));
    }
    user.username = username;
    await user.save();
    res.json({ message: 'Username updated successfully' });
  } catch (err) {
    next(err);
  }
};
