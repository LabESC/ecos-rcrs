module.exports = (sequelize, DataTypes) => {
  let EnvironmentShare = sequelize.define(
    "EnvironmentShare",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      role: {
        type: DataTypes.ENUM("owner", "read"),
        allowNull: false,
      },
    },
    {
      tableName: "environment_share",
      schema: "ic",
    }
  );

  return EnvironmentShare;
};
/*
EnvironmentShare.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    
    !! Relacionamentos - fazer dps
    user_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    !! Relacionamentos - fazer dps
    environment_id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: "environments",
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM("owner", "read"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "EnvironmentShare",
    tableName: "environment_share",
    schema: "ic",
  }
);*/
