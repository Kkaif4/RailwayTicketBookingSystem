import express from 'express';
import tokenVerification from '../middleware/authMiddleware.js';

import { register, login, updateUser } from '../controller/authController.js';
const router = express.Router();

router.post('/create-user', register);
router.post('/login-user', login);
router.put('/update-user', tokenVerification, updateUser);

export default router;
