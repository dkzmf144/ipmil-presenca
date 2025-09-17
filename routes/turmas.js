const express = require("express");
const router = express.Router();
const db = require("../models/turmaModel");

router.get("/", (req, res) => {
  db.all("SELECT * FROM turmas", [], (err, rows) => {
    if(err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { nome, instrutor } = req.body;
  db.run("INSERT INTO turmas (nome, instrutor) VALUES (?, ?)", [nome, instrutor], function(err){
    if(err) return res.status(500).json({error: err.message});
    res.json({success: true, id: this.lastID});
  });
});

module.exports = router;
