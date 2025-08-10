const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

// 🟢 Rota de teste
app.get("/", (req, res) => {
  res.send("API está viva!");
});

// 📊 Rota principal com filtros
app.get("/escolas", (req, res) => {
  const results = [];
  const limit = parseInt(req.query.limit) || 100;

  // Filtros da query string
  const municipio = req.query.municipio?.toUpperCase();
  const rede = req.query.rede?.toUpperCase();
  const etapa = req.query.etapa?.toUpperCase();
  const modalidade = req.query.modalidade?.toUpperCase();
  const localizacao = req.query.localizacao?.toUpperCase();
  const turno = req.query.turno?.toUpperCase();
  const minAlunos = parseInt(req.query.minAlunos) || 0;
  const biblioteca = req.query.biblioteca === "true";
  const internet = req.query.internet === "true";

  const csvPath = path.resolve(__dirname, "microdados_ed_basica_2024.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("❌ Arquivo CSV não encontrado:", csvPath);
    return res
      .status(500)
      .json({ error: "Arquivo CSV não encontrado no servidor" });
  }

  console.log("📂 Iniciando leitura do CSV...");

  try {
    fs.createReadStream(csvPath)
      .pipe(csv({ separator: ";" }))
      .on("data", (row) => {
        // Aplica os filtros
        const atende =
          (!municipio || row["NOME_MUNICIPIO"]?.toUpperCase() === municipio) &&
          (!rede || row["DEPENDENCIA_ADM"]?.toUpperCase() === rede) &&
          (!etapa || row["ETAPA_ENSINO"]?.toUpperCase() === etapa) &&
          (!modalidade ||
            row["MODALIDADE_ENSINO"]?.toUpperCase() === modalidade) &&
          (!localizacao || row["LOCALIZACAO"]?.toUpperCase() === localizacao) &&
          (!turno || row["TURNO_FUNCIONAMENTO"]?.toUpperCase() === turno) &&
          parseInt(row["NUM_ALUNOS"]) >= minAlunos &&
          (!biblioteca || row["BIBLIOTECA"]?.toUpperCase() === "SIM") &&
          (!internet || row["INTERNET"]?.toUpperCase() === "SIM");

        if (atende && results.length < limit) {
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
  } catch (err) {
    console.error("🔥 Erro inesperado:", err.message);
    res.status(500).json({ error: "Erro inesperado ao processar o CSV" });
  }
});

// 🚀 Inicializa o servidor
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ API rodando na porta ${port}`);
});

app.get("/opcoes", (req, res) => {
  const municipios = new Set();
  const redes = new Set();
  const etapas = new Set();

  const csvPath = path.resolve(__dirname, "microdados_ed_basica_2024.csv");

  if (!fs.existsSync(csvPath)) {
    return res.status(500).json({ error: "Arquivo CSV não encontrado" });
  }

  fs.createReadStream(csvPath)
    .pipe(csv({ separator: ";" }))
    .on("data", (row) => {
      municipios.add(row["NOME_MUNICIPIO"]);
      redes.add(row["DEPENDENCIA_ADM"]);
      etapas.add(row["ETAPA_ENSINO"]);
    })
    .on("end", () => {
      res.json({
        municipios: Array.from(municipios).sort(),
        redes: Array.from(redes).sort(),
        etapas: Array.from(etapas).sort(),
      });
    })
    .on("error", (err) => {
      res.status(500).json({ error: "Erro ao ler CSV" });
    });
});
