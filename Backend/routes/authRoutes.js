import express from "express";
import {
  registerClient,
  loginClient,
  logoutClient,
  resetPassword,
  refreshToken,
  verifyEmail,
  resendOTP,
  requestPasswordReset,
  getClientProfile,
} from "../controllers/authController.js";
import authenticateClient from "../middlewares/authMiddleware.js";

const router = express.Router();

// Registration flow with email verification
router.post("/register", registerClient); // Step 1: Register and send OTP
router.post("/verify-email", verifyEmail); // Step 2: Verify OTP and complete registration
router.post("/resend-otp", resendOTP); // Resend OTP if needed

// Authentication routes
router.post("/login", loginClient);
router.post("/logout", authenticateClient, logoutClient);
router.post("/refresh-token", refreshToken);

// Password reset routes
// Send OTP for password reset
router.post("/request-reset", requestPasswordReset);
// Reset password using OTP
router.post("/reset-password", resetPassword);
router.get("/me", authenticateClient, getClientProfile);

export default router;
