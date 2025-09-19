import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Client from "./client.js";
import QRCode from "qrcode";

const Ticket = sequelize.define(
  "Ticket",
  {
    ticket_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "client_id",
      },
      onDelete: "CASCADE",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qr_code: {
      type: DataTypes.TEXT, // will store Base64 QR string or image path
      allowNull: true,
    },
    temple: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_of_tickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10, // 🔹 max 10 tickets allowed
      },
    },
  },
  {
    tableName: "tickets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Relations
Client.hasMany(Ticket, { foreignKey: "client_id" });
Ticket.belongsTo(Client, { foreignKey: "client_id" });

export default Ticket;
