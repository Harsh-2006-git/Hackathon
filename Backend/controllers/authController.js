import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Client from "../models/client.js";
import { v4 as uuidv4 } from "uuid";
const JWT_SECRET = process.env.JWT_SECRET; // store securely

export const register = async (req, res) => {
  try {
    const { name, phone, email, password, userType } = req.body;

    // check if phone already exists
    const existingPhone = await Client.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone already registered" });
    }
    let unique_code = "RFID-" + uuidv4(); // e.g., RFID-3fa85f64-5717-4562-b3fc-2c963f66afa6

    // check if email already exists (if provided)
    if (email) {
      const existingEmail = await Client.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new client
    const client = await Client.create({
      name,
      phone,
      email: email || null, // allow null if not provided
      userType,
      unique_code,
      password: hashedPassword,
    });

    // generate jwt token right after registration
    const token = jwt.sign(
      {
        client_id: client.client_id,
        phone: client.phone,
        email: client.email,
        userType: client.userType,
        unique_code: client.unique_code,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        client_id: client.client_id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        userType: client.userType,
        unique_code: client.unique_code,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    // Handle duplicate entry gracefully
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: `Duplicate entry: ${
          error.fields ? JSON.stringify(error.fields) : "already exists"
        }`,
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const client = await Client.findOne({ where: { phone } });
    if (!client) {
      return res.status(400).json({ message: "Invalid phone or password" });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid phone or password" });
    }

    // generate jwt token
    const token = jwt.sign(
      {
        client_id: client.client_id,
        phone: client.phone,
        email: client.email,
        userType: client.userType,
        unique_code: client.unique_code,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        client_id: client.client_id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        unique_code: client.unique_code,
        userType: client.userType,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
