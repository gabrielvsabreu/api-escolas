const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const app = express();

const port = process.env.PORT || 3000;

app.get("/escolas", (req, res) => {
  const results = [];
  const limit = parseInt(req.query.limit) || 100;

  fs.createReadStream("microdados_ed_basica_2024.csv")
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
    });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`API rodando na porta ${port}`);
});

app.get("/", (req, res) => {
  res.send("API está viva!");
});
