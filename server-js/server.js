// ! Importando módulos
const app = require("./app");
const db = require("./database/db");
const config = require("./config");
const cron = require("node-cron");

// ! Tarefas agendadas
const CronJobs = require("./service/CronJobs");
// ! Atualiza status de votação das definições de ambiente
cron.schedule("0 0,15,30,45 */1 * * *", function () {
  CronJobs.updateEnvironmentsDefinitionVotingStatus();
  console.log(
    "CRON: running a task every 0,15,30 and 45 minute of hour (at second 0)"
  );
});

// ! Atualiza status de votação das prioridades de ambiente
cron.schedule("0 7,22,37,52 */1 * * *", function () {
  CronJobs.updateEnvironmentsPriorityVotingStatus();
  console.log(
    "CRON: running a task every 7,22,37 and 52 minute of hour (at second 0)"
  );
});

// ! Autenticando com o banco e iniciando servidor
db.sequelize
  .authenticate({ logging: false })
  .then(async () => {
    console.log("\nModelos:\n", db.sequelize.models, "\n");
    // *Inserir parâmetro "{ force: true }" no método sync() para forçar a redefinição das tabelas que foram modificadas (drop table e recrição)
    // ! await db.sequelize.sync({ force: true });
    // ! await db.sequelize.sync();

    // * Caso a tabela não seja recriada: usar função drop(), executar uma vez, depois remover (caso não remova, as tabelas serão sempre derrubadas)
    // ! await db.sequelize.drop();

    // . Iniciando servidor
    app.listen(config.port, () => console.log("on: " + config.port));
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
