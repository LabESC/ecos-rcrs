require("dotenv").config();

module.exports = {
  db_ssl: process.env.DB_SSL,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  schema: process.env.DB_SCHEMA,
  port: process.env.APP_PORT,
  servicesLogin: process.env.SERVICES_LOGIN,
  servicesPassword: process.env.SERVICES_PWD,
  apiMicroserviceBase: process.env.API_MICROSERVICE_BASE,
  topicMicroserviceBase: process.env.TOPIC_MICROSERVICE_BASE,
  clientUrlBase: process.env.CLIENT_URL_BASE,
};
