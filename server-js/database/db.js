const { Sequelize } = require("sequelize");
const config = require("../config.js");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    schema: config.schema,
    dialect: config.dialect,
  }
);

module.exports = sequelize;
