// controllers/lostItemController.js
import LostItem from "../models/lostItem.js";

// Add a new lost item
// controllers/lostItemController.js
export const addLostItem = async (req, res) => {
  try {
    const { itemName, description, locationFound, contactNumber, status } =
      req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const item = await LostItem.create({
      itemName,
      description,
      locationFound,
      contactNumber,
      status,
      imageUrl,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Error adding lost item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all lost items
export const getAllLostItems = async (req, res) => {
  try {
    const items = await LostItem.findAll({ order: [["created_at", "DESC"]] });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching lost items:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
