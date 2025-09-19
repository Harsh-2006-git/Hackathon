// models/zoneTracker.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Client from "./client.js";
import Zone from "./zone.js";

const ZoneTracker = sequelize.define(
  "ZoneTracker",
  {
    tracker_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    client_id: { type: DataTypes.INTEGER, allowNull: false },
    last_zone_id: { type: DataTypes.INTEGER, allowNull: true },
    current_zone_id: { type: DataTypes.INTEGER, allowNull: true },
    scanned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "zone_trackers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Associations with proper aliases
ZoneTracker.belongsTo(Client, { foreignKey: "client_id", as: "client" });
ZoneTracker.belongsTo(Zone, {
  foreignKey: "current_zone_id",
  as: "currentZone",
});
ZoneTracker.belongsTo(Zone, { foreignKey: "last_zone_id", as: "lastZone" });

export default ZoneTracker;
