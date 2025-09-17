const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("views")); // para acessar HTMLs diretamente

// Rotas
const turmasRoutes = require("./routes/turmas");
const alunosRoutes = require("./routes/alunos");
const presencaRoutes = require("./routes/presenca");

app.use("/turmas", turmasRoutes);
app.use("/alunos", alunosRoutes);
app.use("/presenca", presencaRoutes);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
