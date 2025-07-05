import express from 'express';
import { bookTicket, cancelTicket, getMyTickets } from '../controller/ticketController.js';
// import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// Book ticket 
router.post('/book', bookTicket);

// Get my tickets 
router.get('/myTickets', getMyTickets);

// Cancel ticket
router.post('/cancel', cancelTicket);


export default router;
