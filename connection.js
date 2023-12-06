const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.POSTGRESQL_DB,
  process.env.POSTGRESQL_USERNAME,
  process.env.POSTGRESQL_PASS,
  {
    port: process.env.POSTGRESQL_PORT,
    host: "localhost",
    dialect: "postgres",
  }
);

module.exports = { sequelize };
