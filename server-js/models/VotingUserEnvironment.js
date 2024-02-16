module.exports = (sequelize, DataTypes) => {
  let VotingUserEnvironment = sequelize.define(
    "VotingUserEnvironment",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      votes_rcr_definition: {
        type: DataTypes.JSONB,
      },
      votes_rcr_priority: {
        type: DataTypes.JSONB,
      },
    },
    {
      tableName: "voting_users_environments",
      schema: "ic",
    }
  );

  return VotingUserEnvironment;
};
/*
VotingUserEnvironment.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    // !! Relacionamentos - definir dps 
    voting_user_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: 'voting_users',
        key: 'id'
      }
    },
    // !! Relacionamentos - definir dps 
    environment_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: 'environments',
        key: 'id'
      }
    },
    votes_rcr_definition: {
      type: DataTypes.JSONB,
    },
    votes_rcr_priority: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize,
    modelName: "VotingUserEnvironment",
    tableName: "voting_users_environments",
    schema: "ic",
  }
);

module.exports = VotingUserEnvironment;
*/
