const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

// Rota de teste
app.get("/", (req, res) => {
  res.send("API está viva!");
});

// Rota de exemplo
app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

// Inicializa o servidor
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ API rodando na porta ${port}`);
});
