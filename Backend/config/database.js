import * as dotenv from "dotenv";
dotenv.config();
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME, // coupon_db
  process.env.DB_USER, // root
  process.env.DB_PASSWORD, // Harsh@1234
  {
    host: process.env.DB_HOST, // localhost
    port: Number(process.env.DB_PORT), // 3306
    dialect: "mysql",
    logging: false, // disable SQL logs (set to true if debugging)
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  console.log("Database connection attempt...");
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

export { sequelize, connectDB };
export default sequelize;
