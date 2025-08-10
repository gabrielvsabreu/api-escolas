const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

// 🔍 Rota de teste para verificar se a API está viva
app.get("/", (req, res) => {
  res.send("API está viva!");
});

// 📊 Rota principal para leitura do CSV
app.get("/escolas", (req, res) => {
  const results = [];
  const limit = parseInt(req.query.limit) || 100;

  // 🔧 Caminho absoluto do CSV
  const csvPath = path.resolve(__dirname, "microdados_ed_basica_2024.csv");
  console.log("🔍 Verificando caminho do CSV:", csvPath);

  // 🧱 Verifica se o arquivo existe antes de tentar ler
  if (!fs.existsSync(csvPath)) {
    console.error("Arquivo CSV não encontrado:", csvPath);
    return res
      .status(500)
      .json({ error: "Arquivo CSV não encontrado no servidor" });
  }

  console.log("📂 Iniciando leitura do CSV...");

  // 📥 Leitura do CSV com tratamento de erro
  fs.createReadStream(csvPath)
    .pipe(csv({ separator: ";" }))
    .on("data", (row) => {
      if (results.length < limit) {
        results.push(row);
      }
    })
    .on("end", () => {
      console.log(
        `✅ CSV lido com sucesso. Retornando ${results.length} registros.`
      );
      res.json(results);
    })
    .on("error", (err) => {
      console.error("⚠️ Erro ao ler CSV:", err.message);
      res.status(500).json({ error: "Erro ao ler o arquivo CSV" });
    });
});

// 🚀 Inicializa o servidor
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ API rodando na porta ${port}`);
});
