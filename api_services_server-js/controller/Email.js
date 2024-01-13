// * Importando as bibliotecas
const { Router } = require("express");
const router = Router();

// * Importando módulos
const validation = require("../validations/Email");
const { validate_service_user } = require("../service/Auth");

// * Importando classe Email
const emailSender = require("../service/Email");

// ! Rota de solicitação de mineração
router.post("/api/email/send", async (req, res) => {
  // * Obtendo dados da requisição
  const { body, headers } = req;

  // * Validando variáveis
  const valid = await validation(headers, body);

  // * Se não for válido, retorne erro
  if (!valid) {
    return res.status(422).json({ error: "Invalid request." });
  }

  // * Se for válido, autentique o usuário de serviço
  if (
    !validate_service_user(headers["service-login"], headers["service-pwd"])
  ) {
    return res.status(401).json({ error: "Authentication failed!" });
  }

  // * Obtendo repos e environment_id
  const { to, subject, text } = body;

  // * Adicionando requisição na fila
  const emailResponse = await emailSender(to, subject, text);

  // * Se não for possível enviar o email, retorne erro
  if (!emailResponse) {
    return res
      .status(500)
      .json({ error: "Internal server error. Email not sent." });
  }

  return res.status(200).json({ message: "Email sent" });
});

module.exports = router;
