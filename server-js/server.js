// ! Importando módulos
const app = require("./app");
const db = require("./sqlModels");
const config = require("./config");

// ! Autenticando com o banco e iniciando servidor
db.sequelize
  .authenticate()
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
