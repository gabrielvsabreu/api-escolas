const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("API está viva!");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ API rodando na porta ${port}`);
});
