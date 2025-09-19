import express from "express";
import {
  createTicket,
  getTicketsByClient,
} from "../controllers/ticketController.js";
import authenticateClient from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/create", authenticateClient, createTicket); // Create ticket
router.get("/get", authenticateClient, getTicketsByClient); // Get tickets for a client

export default router;
