// Importando módulos do express
const express = require("express");
const cors = require("cors");
const app = express();

// Configurando Express
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Importando rotas
app.use("/api/user", require("./routes/User"));
app.use("/api/environment", require("./routes/Environment"));
app.use("/api/votinguser", require("./routes/VotingUser"));

module.exports = app;
