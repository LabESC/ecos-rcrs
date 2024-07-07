module.exports = (sequelize, DataTypes) => {
  let GitHubInstallations = sequelize.define(
    "GitHubInstallations",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      github_user: {
        // Can also be an organization
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      github_installation_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "github_installations",
      schema: "ic",
    }
  );

  return GitHubInstallations;
};
