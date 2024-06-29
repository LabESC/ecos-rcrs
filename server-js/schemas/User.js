const Joi = require("joi");

const UserBase = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const UserRequest = UserBase;

const UserResponse = Joi.object({
  id: Joi.string()
    .guid({
      version: "uuidv4",
    })
    .required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  status: Joi.string().valid("active", "inactive", "pending").required(),
});

const ManyUsersResponse = Joi.array().items(UserResponse);

const AuthRequest = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const AuthResponse = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string()
    .guid({
      version: "uuidv4",
    })
    .required(),
});

const PasswordRequest = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});

const UserUpdate = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  github_user: Joi.string(),
});

const GitHubRequest = Joi.object({
  github_user: Joi.string().required(),
  installation_id: Joi.string().required(),
});

module.exports = {
  UserBase,
  UserRequest,
  UserResponse,
  ManyUsersResponse,
  AuthRequest,
  AuthResponse,
  PasswordRequest,
  UserUpdate,
  GitHubRequest,
};
