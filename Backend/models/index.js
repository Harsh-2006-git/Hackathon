// models/index.js
import { sequelize } from "../config/database.js";
import Client from "./client.js";
import Ticket from "./ticket.js";
import TicketTimeCount from "./ticketTimeCount.js";

// Define all associations here
const models = {
  Client,
  Ticket,
  TicketTimeCount,
};

// Client associations
Client.hasMany(Ticket, {
  foreignKey: "client_id",
  as: "tickets",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Ticket associations
Ticket.belongsTo(Client, {
  foreignKey: "client_id",
  as: "client",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// TicketTimeCount associations
TicketTimeCount.hasMany(Ticket, {
  foreignKey: ["darshan_date", "darshan_time"],
  sourceKey: ["darshan_date", "darshan_time"],
  as: "tickets",
  constraints: false, // Using composite foreign key
});

Ticket.belongsTo(TicketTimeCount, {
  foreignKey: ["darshan_date", "darshan_time"],
  targetKey: ["darshan_date", "darshan_time"],
  as: "time_slot",
  constraints: false, // Using composite foreign key
});

// Add associate methods for existing models if they have them
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { models, initDatabase, sequelize };
export default models;
