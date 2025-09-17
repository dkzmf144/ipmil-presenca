const express = require("express");
const router = express.Router();
const db = require("../models/presencaModel");
const alunoDB = require("../models/alunoModel");
const gerarPDF = require("../utils/gerarPDF");

// Listar presenças
router.get("/", (req, res) => {
  db.all("SELECT presenca.id, alunos.nome, presenca.data, presenca.presente FROM presenca JOIN alunos ON presenca.aluno_id = alunos.id", [], (err, rows) => {
    if(err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// Marcar presença
router.post("/marcar", (req, res) => {
  const { aluno_id, presente } = req.body;
  const data = new Date().toISOString().split("T")[0];

  db.run(
    "INSERT INTO presenca (aluno_id, data, presente) VALUES (?, ?, ?)",
    [aluno_id, data, presente],
    function(err){
      if(err) return res.status(500).send(err.message);

      // Envia mensagem via WhatsApp se ausente
      if(presente == 0){
        alunoDB.get("SELECT * FROM alunos WHERE id = ?", [aluno_id], (err, aluno) => {
          if(aluno && aluno.whatsapp){
            const msg = `Olá ${aluno.nome}, você esteve ausente na aula de hoje. Compareça na próxima sessão.`;
            // Abre WhatsApp Web com mensagem pronta
            const link = `https://wa.me/${aluno.whatsapp}?text=${encodeURIComponent(msg)}`;
            console.log(`Abra este link para enviar a mensagem: ${link}`);
          }
        });
      }

      res.json({success: true});
    }
  );
});

// Gerar PDF de faltas
router.get("/relatorio", (req, res) => {
  db.all(
    `SELECT alunos.nome, COUNT(*) as faltas
     FROM presenca
     JOIN alunos ON presenca.aluno_id = alunos.id
     WHERE presente = 0
     GROUP BY alunos.nome`,
    [],
    (err, rows) => {
      if(err) return res.status(500).send(err.message);

      const arquivo = "./db/relatorio_faltas.pdf";
      gerarPDF(rows, arquivo);

      res.download(arquivo); // envia PDF para o navegador baixar
    }
  );
});

module.exports = router;
