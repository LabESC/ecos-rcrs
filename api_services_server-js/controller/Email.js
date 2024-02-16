// * Importando as bibliotecas
const { Router } = require("express");
const router = Router();

// * Importando módulos
const validation = require("../validations/Email");
const { validate_service_user } = require("../service/Auth");

// * Importando classe Email
const { sendEmail: emailSender, validateEmail } = require("../service/Email");

// ! Rota de solicitação de mineração
router.post("/api/email/send", async (req, res) => {
  // !! LOG
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);

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

// ! Rota de validação de email
router.post("/api/email/:email/validate", async (req, res) => {
  // !! LOG
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);

  // * Obtendo dados da requisição
  const { email } = req.params;

  // * Validando variáveis
  if (!email) {
    return res.status(422).json({ error: "Invalid request." });
  }

  // * Validando email
  const emailResponse = await validateEmail(email);

  // * Se não for possível validar o email, retorne erro
  if (!emailResponse) {
    return res
      .status(500)
      .json({ error: "Internal server error. Email not validated." });
  }

  return res.status(200).json({ message: "Email validated" });
});

module.exports = router;
