// * Importando as bibliotecas
const { Router } = require("express");
const router = Router();

// * Importando módulos
const { allWords } = require("../utils/Keywords");

// ! Rota de obtenção de palavras-chave
router.get("/api/keywords", async (req, res) => {
  // !! LOG
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleString()}`);

  return res.status(200).json({ keywords: allWords });
});

module.exports = router;
