import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Ticket = sequelize.define(
  "Ticket",
  {
    ticket_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "client_id",
      },
    },
    darshan_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    darshan_time: {
      type: DataTypes.ENUM(
        "08:00 AM",
        "08:30 AM",
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "12:00 PM",
        "12:30 PM",
        "01:00 PM",
        "01:30 PM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM",
        "04:00 PM",
        "04:30 PM",
        "05:00 PM",
        "05:30 PM",
        "06:00 PM",
        "06:30 PM",
        "07:00 PM",
        "07:30 PM",
        "08:00 PM"
      ),
      allowNull: false,
    },
    expiry_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    qr_code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
    },
    status: {
      type: DataTypes.ENUM("booked", "cancelled", "completed", "used"),
      defaultValue: "booked",
      allowNull: false,
    },
    tickets_purchased: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tickets_remaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "tickets",
    timestamps: true,
    indexes: [
      { fields: ["client_id"] },
      { fields: ["darshan_date", "darshan_time"] },
    ],
  }
);

export default Ticket;
