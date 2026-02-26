import { Sequelize } from "sequelize";
import config from "../config";

const sequelize = new Sequelize(config.database_url as string, {
  dialect: "postgres",
  logging: config.NODE_ENV === "development" ? console.log : false,
  dialectOptions:
    config.NODE_ENV === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
