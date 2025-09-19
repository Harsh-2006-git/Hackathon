import express from "express";
import multer from "multer";
import {
  createLostFound,
  getLostFoundItems,
} from "../controllers/lostFoundController.js";
import authMiddleware from "../middlewares/authMiddleware.js"; // <-- make sure this adds req.user

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("image"), createLostFound);
router.get("/get", getLostFoundItems);

export default router;
