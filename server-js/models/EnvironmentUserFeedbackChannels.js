module.exports = (sequelize, DataTypes) => {
  let EnvironmentUserFeedbackChannels = sequelize.define(
    "EnvironmentUserFeedbackChannels",
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
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "environment_user_feedback_channels",
      schema: "ic",
    }
  );

  return EnvironmentUserFeedbackChannels;
};
