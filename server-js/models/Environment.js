module.exports = (sequelize, DataTypes) => {
  let Environment = sequelize.define(
    "Environment",
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
        allowNull: false,
      },
      repos: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      mining_type: {
        type: DataTypes.ENUM("organization", "repos"),
        allowNull: false,
      },
      filter_type: {
        type: DataTypes.ENUM("none", "keywords", "linreg"),
        allowNull: false,
        defaultValue: "none",
      },
      keywords: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      rcr_keywords: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      organization_name: {
        type: DataTypes.STRING(255),
      },
      mining_data: {
        type: DataTypes.JSONB,
      },
      topic_data: {
        type: DataTypes.JSONB,
      },
      definition_data: {
        type: DataTypes.JSONB,
      },
      priority_data: {
        type: DataTypes.JSONB,
      },
      final_rcr: {
        type: DataTypes.JSONB,
      },
      status: {
        type: DataTypes.ENUM(
          "mining",
          "mining_error",
          "mining_done",
          "making_topics",
          "topics_error",
          "topics_done",
          "waiting_rcr_voting",
          "processing_rcr_voting",
          "rcr_voting_done",
          "waiting_rcr_priority",
          "processing_rcr_priority",
          "rcr_priority_done",
          "done",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "mining",
      },
    },
    {
      tableName: "environments",
      schema: "ic",
    }
  );

  return Environment;
};
/*
Environment.init(
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
    details: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    repos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    mining_type: {
      type: DataTypes.ENUM("organization", "repos"),
      allowNull: false,
    },
    organization_name: {
      type: DataTypes.STRING(255),
    },
    mining_data: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
    },
    topic_data: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
    },
    definition_data: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
    },
    priority_data: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
    },
    final_rcr: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
    },
    status: {
      type: DataTypes.ENUM(
        "mining",
        "mining_error",
        "mining_done",
        "making_topics",
        "topics_error",
        "topics_done",
        "waiting_rcr_voting",
        "rcr_voting_done",
        "waiting_rcr_priority",
        "rcr_priority_done",
        "done",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "mining",
    },
    !! Alterar last_updated para updated_at
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    modelName: "Environment",
    tableName: "environments",
    schema: "ic",
  }
);*/
