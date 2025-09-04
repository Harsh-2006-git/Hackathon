// routes/lostItemRoutes.js
import express from "express";
import multer from "multer";
import {
  addLostItem,
  getAllLostItems,
} from "../controllers/lostItemController.js";

const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save inside /uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.post("/add", upload.single("image"), addLostItem);
router.get("/all", getAllLostItems);

export default router;
