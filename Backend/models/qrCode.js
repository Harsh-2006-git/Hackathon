// models/qrCode.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Client from "./client.js";

const QRCodeModel = sequelize.define(
  "QRCode",
  {
    qr_id: {
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
      onUpdate: "CASCADE",
    },
    unique_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    qr_image: {
      type: DataTypes.TEXT, // store base64 string of QR
      allowNull: true,
    },
  },
  {
    tableName: "qr_codes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Association: Each QR code belongs to a client
QRCodeModel.belongsTo(Client, { foreignKey: "client_id", as: "client" });

export default QRCodeModel;
