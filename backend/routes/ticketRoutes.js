import express from 'express';
import { bookTicket, getMyTickets, singleTicket, cancelTicket } from '../controller/ticketController.js';
import  tokenVerification from '../middleware/authMiddleware.js';

const router = express.Router();

//Book a ticket
router.post('/book', tokenVerification, bookTicket);

// Get all tickets
router.get('/my-tickets', tokenVerification, getMyTickets);

//Get single ticket
router.get('/singleTicket/:ticketId', tokenVerification, singleTicket);

// Cancel a ticket
router.put('/cancel/:ticketId', tokenVerification, cancelTicket);

export default router;
