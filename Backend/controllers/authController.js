import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Client from "../models/client.js";

import {
  sendResetPasswordEmail,
  sendOTPEmail,
  generateOTP,
} from "../utils/emailService.js";

/**
 * Register a new client with email and password - Step 1: Send OTP
 */
export const registerClient = async (req, res) => {
  const { name, phone, email, password, userType } = req.body;
  try {
    const existingClient = await Client.findOne({ where: { email } });
    if (existingClient) {
      if (existingClient.email_verified) {
        return res
          .status(400)
          .json({ message: "Email already registered and verified" });
      } else {
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await existingClient.update({
          otp_code: otp,
          otp_expires: otpExpires,
        });
        await sendOTPEmail(email, otp);

        return res.status(200).json({
          message:
            "Account exists but not verified. New verification code sent to your email.",
          client_id: existingClient.client_id,
          email: existingClient.email,
          requires_verification: true,
        });
      }
    }

    // New client
    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const client = await Client.create({
      email,
      password: hashedPassword,
      userType: userType,
      email_verified: false,
      otp_code: otp,
      otp_expires: otpExpires,
      name: name,
      phone: phone,
    });

    await sendOTPEmail(email, otp);

    res.status(201).json({
      message:
        "Registration successful! Please check your email for verification code.",
      client_id: client.client_id,
      email: client.email,
      requires_verification: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verify email with OTP - Step 2: Complete registration
 */
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const client = await Client.findOne({ where: { email } });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (client.email_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!client.otp_code || client.otp_code !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date() > client.otp_expires) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    await client.update({
      email_verified: true,
      otp_code: null,
      otp_expires: null,
    });

    const token = jwt.sign(
      { id: client.client_id, role: client.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: client.client_id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await client.update({ refresh_token: refreshToken });

    res.status(200).json({
      message: "Email verified successfully! You are now logged in.",
      token,
      refreshToken,
      user: {
        id: client.client_id,
        email: client.email,
        email_verified: true,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: error.message });
  }
};

// controllers/clientController.js

// Step 1: Request reset OTP
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const client = await Client.findOne({ where: { email } });

    if (!client || !client.email_verified) {
      return res
        .status(400)
        .json({ message: "No verified account found with this email" });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await client.update({
      otp_code: otp,
      otp_expires: otpExpires,
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "Password reset OTP sent to your email.",
      client_id: client.client_id,
      email: client.email,
      requires_verification: true,
    });
  } catch (error) {
    console.error("Request password reset error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Step 2: Verify OTP and reset password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const client = await Client.findOne({ where: { email } });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (client.otp_code !== otp || client.otp_expires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await client.update({
      password: hashedPassword,
      otp_code: null,
      otp_expires: null,
    });

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Login a client with email and password
 */
export const loginClient = async (req, res) => {
  const { email, password } = req.body;
  try {
    const client = await Client.findOne({ where: { email } });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (!client.email_verified) {
      return res.status(403).json({
        message: "Please verify your email first",
        requires_verification: true,
        email: client.email,
      });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { client_id: client.client_id, role: client.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: client.client_id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await client.update({ refresh_token: refreshToken });

    res.json({
      token,
      refreshToken,
      user: {
        id: client.client_id,
        email,
        email_verified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Resend OT
 */
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const client = await Client.findOne({ where: { email } });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (client.email_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await client.update({
      otp_code: otp,
      otp_expires: otpExpires,
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "New verification code sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const logoutClient = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const client = await Client.findByPk(req.user.id);
    if (client) {
      await client.update({ refresh_token: null });
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token provided" });
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const client = await Client.findByPk(decoded.id);
    if (!client || client.refresh_token !== refreshToken)
      return res.status(403).json({ message: "Invalid refresh token" });
    const newToken = jwt.sign(
      { id: client.client_id, role: client.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token: newToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export const getClientProfile = async (req, res) => {
  try {
    const clientId = req.user.client_id; // pulled from JWT payload

    const client = await Client.findOne({
      where: { client_id: clientId },
      attributes: { exclude: ["password", "otp_code", "otp_expires"] }, // hide sensitive data
    });

    if (!client) return res.status(404).json({ error: "Client not found" });

    res.json({ success: true, client });
  } catch (error) {
    console.error("Error fetching client profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};
