const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("API está viva!");
});

app.get("/escolas", (req, res) => {
  const results = [];
  const limit = parseInt(req.query.limit) || 100;
  const csvPath = path.resolve(__dirname, "microdados_ed_basica_2024.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("Arquivo CSV não encontrado:", csvPath);
    return res
      .status(500)
      .json({ error: "Arquivo CSV não encontrado no servidor" });
  }

  fs.createReadStream(csvPath)
    .pipe(csv({ separator: ";" }))
    .on("data", (row) => {
      if (results.length < limit) {
        results.push(row);
      }
    })
    .on("end", () => {
      res.json(results);
    })
    .on("error", (err) => {
      console.error("Erro ao ler CSV:", err.message);
      res.status(500).json({ error: "Erro ao ler o arquivo CSV" });
    });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`API rodando na porta ${port}`);
});
