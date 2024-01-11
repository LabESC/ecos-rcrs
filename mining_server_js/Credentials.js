require("dotenv").config();

// * Obtendo dados do arquivo .env
const USER_LOGIN = process.env.USER_LOGIN;
const USER_PWD = process.env.USER_PWD;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DB_MICROSERVICE_BASE = process.env.DB_MICROSERVICE_BASE;
const TOPIC_MICROSERVICE_BASE = process.env.TOPIC_MICROSERVICE_BASE;

module.exports = {
  USER_LOGIN,
  USER_PWD,
  GITHUB_TOKEN,
  DB_MICROSERVICE_BASE,
  TOPIC_MICROSERVICE_BASE,
};
