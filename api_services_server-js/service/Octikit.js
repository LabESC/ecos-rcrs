const fs = require("fs");
const jwt = require("jsonwebtoken");

// Caminho para o .pem da chave privada
const privateKeyPath = "./seco-rcr.2024-06-12.private-key.pem";
const privateKey = fs.readFileSync(privateKeyPath);

// Client ID da GitHub App
const clientId = process.env.GITHUB_APP_CLIENTID;

// Definindo o tempo de expiração do token (em segundos)
const expiresIn = 600; // 10 minutos

// Crianndo a payload do token
const payload = {
  // Emite a claim do JWT (iat) como a hora atual em segundos
  iat: Math.floor(Date.now() / 1000),
  // Define a claim de expiração (exp) como a hora atual mais o tempo de expiração
  exp: Math.floor(Date.now() / 1000) + expiresIn,
  // Define a claim do issuer (iss) como o ID da GitHub App
  iss: clientId,
};

// Assina o token com a chave privada
const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

module.exports = token;
