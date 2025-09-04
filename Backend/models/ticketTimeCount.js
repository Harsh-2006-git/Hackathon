import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const TicketTimeCount = sequelize.define(
  "TicketTimeCount",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    ticket_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    max_capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
    },
  },
  {
    tableName: "ticket_time_counts",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["darshan_date", "darshan_time"],
      },
    ],
  }
);

export default TicketTimeCount;
