import express from 'express';
import authMiddleware from '../middleware/authmiddleware.js';

import {
  register,
  login,
  updateUser
} from '../controller/authController.js';
const router = express.Router();

router.post('/create-user', register);
router.post('/login-user', login);
router.put('/update-user', authMiddleware, updateUser);


export default router;
