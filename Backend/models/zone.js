// models/zone.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Zone = sequelize.define("Zone", {
  zone_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  location_info: { type: DataTypes.STRING, allowNull: true }, // optional: lat/lng or address
  client_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // 👈 new column
});

export default Zone;
