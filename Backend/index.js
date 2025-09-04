import * as dotenv from "dotenv";
import express, { json, response } from "express";
import { connectDB, sequelize } from "./config/database.js";
import errorHandler from "./middlewares/errorHandler.js";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import Ticket from "./routes/ticketRoutes.js";
import LostItem from "./routes/lostItemRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration - FIX 1: Specify exact origins
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
    ], // Add your frontend URLs
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
  })
);

// Middleware - FIX 2: Correct order
app.use(json());
app.use(express.urlencoded({ extended: true })); // Move this up before routes
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // FIX 3: Allow cross-origin resources
  })
);

// Static file serving - FIX 4: Better path resolution
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add a test route to check if files exist
app.get("/test-upload/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: "File not found", path: filePath });
    }
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/ticket", Ticket);
app.use("/api/v1/lost-items", LostItem);

// Error handling middleware (should be last)
app.use(errorHandler);

// Clean server startup
const startServer = async () => {
  try {
    console.log("🔄 Starting server...");

    // Connect to database
    await connectDB();

    // Sync database
    await sequelize.sync({ alter: true });

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log("✅ Database synchronized");
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(
        `📁 Static files served from: ${path.join(__dirname, "uploads")}`
      );
      console.log("📧 Email verification system ready");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
