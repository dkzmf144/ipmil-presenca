const express = require("express");
const router = express.Router();
const db = require("../models/alunoModel");

router.get("/", (req, res) => {
  db.all("SELECT * FROM alunos", [], (err, rows) => {
    if(err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { nome, email, turma_id } = req.body;
  db.run("INSERT INTO alunos (nome, email, turma_id) VALUES (?, ?, ?)", [nome, email, turma_id], function(err){
    if(err) return res.status(500).json({error: err.message});
    res.json({success: true, id: this.lastID});
  });
});

module.exports = router;
