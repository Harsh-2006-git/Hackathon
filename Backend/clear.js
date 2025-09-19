import { sequelize } from "./config/database.js";
import Zone from "./models/zone.js";
import ZoneTracker from "./models/zoneTracker.js";

const clearTables = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    // Delete children first
    await ZoneTracker.destroy({ where: {} });

    // Then delete parent
    await Zone.destroy({ where: {} });

    console.log("✅ All rows deleted.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error deleting rows:", error);
    process.exit(1);
  }
};

clearTables();
