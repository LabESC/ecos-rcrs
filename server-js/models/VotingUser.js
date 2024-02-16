module.exports = (sequelize, DataTypes) => {
  let VotingUser = sequelize.define(
    "VotingUser",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      access_code: {
        type: DataTypes.STRING(8),
        allowNull: true,
      },
    },
    {
      tableName: "voting_users",
      schema: "ic",
    }
  );

  return VotingUser;
};
/*
VotingUser.init(
  {
    id: {
      type: DataTypes.STRING(45),
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    access_code: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "VotingUser",
    tableName: "voting_users",
    schema: "ic",
  }
);

// Relationship (assuming you have a similar setup for the Environment model and VotingUserEnvironment through model)
/*const Environment = require("./model/Environment"); // Adjust the import based on your actual file structure
const VotingUserEnvironment = require("./model/VotingUserEnvironment"); // Adjust the import based on your actual file structure

VotingUser.belongsToMany(Environment, {
  through: VotingUserEnvironment,
  foreignKey: "votingUserId",
  otherKey: "environmentId",
});

Environment.belongsToMany(VotingUser, {
  through: VotingUserEnvironment,
  foreignKey: "environmentId",
  otherKey: "votingUserId",
});

module.exports = VotingUser;
*/
