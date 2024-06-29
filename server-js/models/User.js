module.exports = (sequelize, DataTypes) => {
  let User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.BLOB,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(45),
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "pending"),
        allowNull: false,
        defaultValue: "pending",
      },
      github_user: {
        type: DataTypes.STRING(255),
        unique: true,
      },
      github_installation_id: {
        type: DataTypes.STRING(255),
      },
    },
    {
      tableName: "users",
      schema: "ic",
    }
  );

  return User;
};

/*
class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.STRING(45),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(45),
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },
    
    !! Alterar nas consultas para updated_at
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    schema: "ic",
  }
);

module.exports = User;
*/
