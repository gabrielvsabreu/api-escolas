const cors = require("cors");
const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());

const port = process.env.PORT || 8080;

// 🟢 Rota de teste
app.get("/", (req, res) => {
  res.send("API está viva!");
});

// 📊 Rota principal com filtros
app.get("/escolas", (req, res) => {
  const results = [];
  const limit = parseInt(req.query.limit);

  // Filtros da query string
  const dependencia = req.query.dependencia?.toUpperCase();
  const categoria = req.query.categoria?.toUpperCase();
  const localizacao = req.query.localizacao?.toUpperCase();
  const endereco = req.query.endereco?.toUpperCase();
  const cep = req.query.cep?.toUpperCase();
  const telefone = req.query.telefone?.toUpperCase();
  const areaVerde = req.query.areaVerde === "true";
  const auditorio = req.query.auditorio === "true";
  const banheiroPNE = req.query.banheiroPNE === "true";
  const biblioteca = req.query.biblioteca === "true";
  const labInfo = req.query.labInfo === "true";
  const patioCoberto = req.query.patioCoberto === "true";
  const parqueInfantil = req.query.parqueInfantil === "true";
  const quadraEsporte = req.query.quadraEsporte === "true";
  const refeitorio = req.query.refeitorio === "true";
  const recursosAccessibilidade = req.query.recursosAccessibilidade === "true";
  const internetAlunos = req.query.internetAlunos === "true";
  const alimentacao = req.query.alimentacao === "true";
  const edInfantil = req.query.edInfantil === "true";
  const edFundamental = req.query.edFundamental === "true";
  const edMedio = req.query.edMedio === "true";
  const edProfissional = req.query.edProfissional === "true";
  const edEJA = req.query.edEJA === "true";
  const edEspecial = req.query.edEspecial === "true";

  const csvPath = path.resolve(__dirname, "senso-escolar-blumenau-2024.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("❌ Arquivo CSV não encontrado:", csvPath);
    return res
      .status(500)
      .json({ error: "Arquivo CSV não encontrado no servidor" });
  }

  console.log("📂 Iniciando leitura do CSV...");

  try {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        const atende =
          (!dependencia || row["DEPENDENCIA"]?.toUpperCase() === dependencia) &&
          (!categoria || row["CATEGORIA"]?.toUpperCase() === categoria) &&
          (!localizacao || row["LOCALIZACAO"]?.toUpperCase() === localizacao) &&
          (!endereco || row["ENDERECO"]?.toUpperCase() === endereco) &&
          (!cep || row["CEP"]?.toUpperCase() === cep) &&
          (!telefone || row["TELEFONE"]?.toUpperCase() === telefone) &&
          (areaVerde ? row["AREA_VERDE"] === "Sim" : true) &&
          (auditorio ? row["AUDITORIO"] === "Sim" : true) &&
          (banheiroPNE ? row["BANHEIRO_PNE"] === "Sim" : true) &&
          (biblioteca ? row["BIBLIOTECA"] === "Sim" : true) &&
          (labInfo ? row["LABORATORIO_INFORMATICA"] === "Sim" : true) &&
          (patioCoberto ? row["PATIO_COBERTO"] === "Sim" : true) &&
          (parqueInfantil ? row["PARQUE_INFANTIL"] === "Sim" : true) &&
          (quadraEsporte ? row["QUADRA_ESPORTES"] === "Sim" : true) &&
          (refeitorio ? row["REFEITORIO"] === "Sim" : true) &&
          (recursosAccessibilidade
            ? row["RECURSOS_ACESSIBILIDADE"] === "Sim"
            : true) &&
          (internetAlunos ? row["INTERNET_ALUNOS"] === "Sim" : true) &&
          (alimentacao ? row["ALIMENTACAO"] === "Sim" : true) &&
          (edInfantil ? row["ED_INF"] === "Sim" : true) &&
          (edFundamental ? row["ED_FUND"] === "Sim" : true) &&
          (edMedio ? row["ED_MED"] === "Sim" : true) &&
          (edProfissional ? row["ED_PROF"] === "Sim" : true) &&
          (edEJA ? row["ED_EJA"] === "Sim" : true) &&
          (edEspecial ? row["ED_ESP"] === "Sim" : true);

        if (atende) {
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

// 📋 Rota para preencher os selects
app.get("/opcoes", (req, res) => {
  console.log("🔍 Rota /opcoes acessada");

  const dependencia = new Set();
  const categoria = new Set();
  const localizacao = new Set();

  const csvPath = path.resolve(__dirname, "senso-escolar-blumenau-2024.csv");

  if (!fs.existsSync(csvPath)) {
    return res.status(500).json({ error: "Arquivo CSV não encontrado" });
  }

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (row) => {
      dependencia.add(row["DEPENDENCIA"]);
      categoria.add(row["CATEGORIA"]);
      localizacao.add(row["LOCALIZACAO"]);
    })
    .on("end", () => {
      res.json({
        dependencias: Array.from(dependencia).sort(),
        categorias: Array.from(categoria).sort(),
        localizacoes: Array.from(localizacao).sort(),
      });
    })
    .on("error", (err) => {
      res.status(500).json({ error: "Erro ao ler CSV" });
    });
});

// 🚀 Inicializa o servidor
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ API rodando na porta ${port}`);
});
