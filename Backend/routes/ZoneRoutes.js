import express from "express";
import {
  scanZone,
  getZoneDensity,
  getUserZoneHistory,
} from "../controllers/zoneController.js";
import authenticateClient from "../middlewares/authMiddleware.js";
import {
  generateQRCodeForUser,
  getInfoFromQRScan,
} from "../controllers/zoneController.js";

const router = express.Router();

// Scan QR/RFID and update zone
// ✅ Enter / Exit handled by same route
router.post("/scan", scanZone);

// ✅ Zone density
router.get("/density", getZoneDensity);

// Generate QR for logged-in user
router.get("/generate", authenticateClient, generateQRCodeForUser);

// Scan QR and decode user info
router.post("/scan-qr", authenticateClient, getInfoFromQRScan);

// Get zone history of a specific client
router.get("/history", authenticateClient, getUserZoneHistory);
router.post("/history", authenticateClient, getUserZoneHistory);

export default router;
