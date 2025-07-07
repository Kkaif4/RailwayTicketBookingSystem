import express from 'express';
import { checkAddRoute } from '../middleware/bodyHandler.js';
import { setRoutes } from '../controller/trainRouteController.js';

const router = express.Router();

// router.get('/',);
router.post('/create-route', checkAddRoute, setRoutes);

export default router;
