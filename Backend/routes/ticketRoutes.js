import express from "express";
import {
  bookTicket,
  getTimeSlotAvailability,
  scanTicket,
  getClientTickets,
  cancelTicket,
  checkExpiredTickets,
} from "../controllers/ticketController.js";

const router = express.Router();
import authenticateClient from "../middlewares/authMiddleware.js";

// Public route to check time slot availability
router.get("/availability", getTimeSlotAvailability);

// Apply authentication middleware to all protected routes

// Ticket booking routes
router.post("/", authenticateClient, bookTicket);
router.get("/my-tickets", authenticateClient, getClientTickets);

router.post("/scan", scanTicket);
router.put("/cancel/:ticket_id", cancelTicket);

// Admin-only route to manually check expired tickets
router.post("/admin/check-expired", checkExpiredTickets);

export default router;
