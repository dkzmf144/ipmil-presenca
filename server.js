const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// ==================
// Servir HTML
// ==================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ==================
// MongoDB Atlas
// ==================
mongoose.connect(
  "mongodb+srv://dkzmf144:I$aque144@cluster0.z22l67l.mongodb.net/chamada?retryWrites=true&w=majority&appName=Cluster0"
)
  .then(() => console.log("✅ Conectado ao MongoDB Atlas!"))
  .catch(err => console.log("❌ Erro ao conectar:", err));

// ==================
// Modelo de Aluno
// ==================
const alunoSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nome: { type: String, required: true },
  telefone: { type: String, required: true },
  pelotao: { type: String, required: true },
  responsavel: { type: String, required: true }, // NOVO CAMPO
  status: { type: String, default: "pendente" },
  justificativa: { type: String, default: "pendente" }
});

const Aluno = mongoose.model("Aluno", alunoSchema);

// ==================
// WhatsApp Web
// ==================
const client = new Client({ authStrategy: new LocalAuth() });
let whatsappReady = false;

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

client.on("ready", () => {
  whatsappReady = true;
  console.log("✅ WhatsApp conectado!");
});

client.on("message", async (msg) => {
  const numero = msg.from.replace("@c.us", "");
  const texto = msg.body.toLowerCase();

  if (["1", "2", "3", "4", "sim", "não"].includes(texto)) {
    let aluno = await Aluno.findOne({ telefone: numero });
    if (aluno) {
      aluno.justificativa = texto;
      await aluno.save();
      client.sendMessage(msg.from, "✅ Justificativa registrada!");
    }
  }
});

client.initialize();

// ==================
// Rotas
// ==================

// Listar alunos
app.get("/alunos", async (req, res) => {
  const { pelotao } = req.query;
  let alunos;
  if (pelotao) {
    alunos = await Aluno.find({ pelotao: pelotao.toLowerCase() });
  } else {
    alunos = await Aluno.find();
  }
  res.json(alunos);
});

// Cadastrar aluno
app.post("/alunos", async (req, res) => {
  try {
    const { id, nome, telefone, pelotao, responsavel } = req.body;
    if (!id || !nome || !telefone || !pelotao || !responsavel)
      return res.status(400).send("Campos obrigatórios faltando");

    const novo = new Aluno({
      id,
      nome,
      telefone,
      pelotao: pelotao.toLowerCase(),
      responsavel, // NOVO CAMPO
      status: "pendente",
      justificativa: "pendente"
    });

    await novo.save();
    res.status(201).send("Aluno cadastrado com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao cadastrar aluno");
  }
});

// Marcar presença/falta
app.post("/presenca/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let aluno = await Aluno.findOne({ id: id.trim() });
    if (!aluno) return res.status(404).send("Aluno não encontrado");

    aluno.status = status;
    await aluno.save();

    if (status === "faltou" && whatsappReady) {
      try {
        const chatId = aluno.telefone + "@c.us";
        await client.sendMessage(
          chatId,
          `Olá, ${aluno.responsavel}.
🔰 QUEM FALTA, FAZ FALTA❗🔰
Percebemos no nosso banco de dados que existe uma falta registrada no curso IPMIL nesse sábado em nome de ${aluno.nome}.

Nos faça uma gentileza, e RESPONDA esta mensagem justificando a FALTA de ${aluno.nome}.

ENVIE APENAS O NÚMERO DA OPÇÃO DESEJADA PARA FACILITAR NOSSA COMUNICAÇÃO:

1- Para Justificar e em seguida informe o motivo;
2- Eu Estive Presente;
3- Eu não conheço ninguém desse curso;
4- Quero Falar com Alguém do Setor Pedagógico;

Estamos aqui para Ajudar ❗❗
Atenciosamente
DIRETORA LORENA`
        );
      } catch (err) {
        console.log("⚠️ Erro ao enviar mensagem WhatsApp:", err.message);
      }
    }

    res.send("Status atualizado!");
  } catch (err) {
    console.error("Erro ao atualizar presença:", err);
    res.status(500).send("Erro ao atualizar presença");
  }
});

// Excluir aluno
app.delete("/alunos/:id", async (req, res) => {
  try {
    const idParam = req.params.id.trim().toLowerCase();
    const aluno = await Aluno.findOneAndDelete({
      id: { $regex: new RegExp("^" + idParam + "$", "i") }
    });

    if (!aluno) return res.status(404).send("Aluno não encontrado");
    res.send("Aluno excluído com sucesso!");
  } catch (err) {
    console.error("Erro ao excluir aluno:", err);
    res.status(500).send("Erro ao excluir aluno");
  }
});

// Reiniciar todos os alunos
app.post("/reiniciar", async (req, res) => {
  try {
    await Aluno.updateMany({}, { status: "pendente", justificativa: "pendente" });
    res.send("Todos os alunos foram reiniciados!");
  } catch (err) {
    console.error("Erro ao reiniciar alunos:", err);
    res.status(500).send("Erro ao reiniciar alunos");
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
