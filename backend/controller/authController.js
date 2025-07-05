import User from "../models/User.Model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  return regex.test(password);
};

// Create User
export const register = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (!username || typeof username !== 'string' || username.length < 5) {
      return next(new Error('Username must be at least 5 characters.'));
    }
    if (!validatePassword(password)) {
      return next(new Error('Password must have uppercase, lowercase, number, special character, and 6+ chars.'));
    }
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return next(new Error('Username already exists.'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ message: 'User created successfully', token });
  } catch (err) {
    next(err);
  }
};

// Login User
export const login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return next(new Error('Invalid username or password.'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new Error('Invalid username or password.'));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    next(err);
  }
};

// Update User 
export const updateUser = async (req, res, next) => {
  const { username } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new Error('User not found.'));
    }
    user.username=username
    await user.save();

    res.json({ message: 'Username updated successfully' });
  } catch (err) {
    next(err);
  }
};