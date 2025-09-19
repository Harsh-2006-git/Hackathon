import express from "express";
import Client from "../models/client.js";
import { register, login } from "../controllers/authController.js";

import authenticateClient from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateClient, async (req, res) => {
  try {
    const client = await Client.findByPk(req.user.client_id, {
      attributes: [
        "client_id",
        "name",
        "phone",
        "email",
        "unique_code",
        "userType",
        "created_at",
        "updated_at",
      ],
    });

    if (!client) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Welcome to profile",
      user: client,
    });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
