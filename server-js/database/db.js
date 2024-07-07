const Sequelize = require("sequelize");
const config = require("../config");
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  // ! Verificando se a conexão com o banco de dados é segura (SSL), se for, defina o ssl como require
  config.db_ssl === "true"
    ? {
        host: config.host,
        dialect: config.dialect,
        logging: false,
        dialectOptions: {
          ssl: {
            rejectUnauthorized: false,
            sslmode: "require",
          },
        },
      }
    : { host: config.host, dialect: config.dialect, logging: false }
);

// . Modelos
db.User = require("../models/User")(sequelize, Sequelize.DataTypes);
db.GitHubInstallations = require("../models/GitHubInstallations")(
  sequelize,
  Sequelize.DataTypes
);
db.Environment = require("../models/Environment")(
  sequelize,
  Sequelize.DataTypes
);
db.EnvironmentShare = require("../models/EnvironmentShare")(
  sequelize,
  Sequelize.DataTypes
);
db.VotingUser = require("../models/VotingUser")(sequelize, Sequelize.DataTypes);
db.VotingUserEnvironment = require("../models/VotingUserEnvironment")(
  sequelize,
  Sequelize.DataTypes
);

// ! Relacionamentos
// . User x GitHubInstallations (1 x N)
db.User.hasMany(db.GitHubInstallations, {
  foreignKey: "user_id",
  sourceKey: "id",
});
db.GitHubInstallations.belongsTo(db.User, {
  foreignKey: "user_id",
  targetKey: "id",
});

// . User x Environment (1 x N)
db.User.hasMany(db.Environment, {
  foreignKey: "user_id",
  sourceKey: "id",
});
db.Environment.belongsTo(db.User, {
  foreignKey: "user_id",
  targetKey: "id",
});

// . User x Environment  (N x N: EnvironmentShare)
// * Relacoes 1 x N
db.User.hasMany(db.EnvironmentShare, {
  foreignKey: "user_id",
  sourceKey: "id",
});

db.Environment.hasMany(db.EnvironmentShare, {
  foreignKey: "environment_id",
  sourceKey: "id",
});

// * Relacoes N x 1
db.EnvironmentShare.belongsTo(db.User, {
  foreignKey: "user_id",
  targetKey: "id",
});

db.EnvironmentShare.belongsTo(db.Environment, {
  foreignKey: "environment_id",
  targetKey: "id",
});

// . VotingUser x Environment  (N x N: VotingUserEnvironment)
// * Relacoes 1 x N
db.VotingUser.hasMany(db.VotingUserEnvironment, {
  foreignKey: "voting_user_id",
  sourceKey: "id",
});

db.Environment.hasMany(db.VotingUserEnvironment, {
  foreignKey: "environment_id",
  sourceKey: "id",
});

// * Relacoes N x 1
db.VotingUserEnvironment.belongsTo(db.VotingUser, {
  foreignKey: "voting_user_id",
  targetKey: "id",
});

db.VotingUserEnvironment.belongsTo(db.Environment, {
  foreignKey: "environment_id",
  targetKey: "id",
});

// ! Exportando instancia do bd (sequelize) e o proprio sequelize (Sequelize)
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
