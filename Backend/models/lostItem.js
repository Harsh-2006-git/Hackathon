// models/lostItem.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const LostItem = sequelize.define(
  "LostItem",
  {
    item_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    itemName: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    locationFound: { type: DataTypes.STRING, allowNull: false },
    contactNumber: { type: DataTypes.STRING, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("Lost", "Found"),
      defaultValue: "Lost",
    },
  },
  {
    tableName: "lost_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default LostItem;
