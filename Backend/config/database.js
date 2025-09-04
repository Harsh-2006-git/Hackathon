import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true"
          ? {
              ca: fs.readFileSync(process.env.DB_CA_CERT_PATH),
              rejectUnauthorized: true,
            }
          : undefined,
      connectTimeout: 60000,
    },
    logging: false,
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
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

export { sequelize, connectDB };
export default sequelize;
