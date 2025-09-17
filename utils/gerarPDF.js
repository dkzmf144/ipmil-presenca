const fs = require("fs");
const PDFDocument = require("pdfkit");

function gerarPDF(dados, arquivo) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(arquivo));

  doc.fontSize(18).text("Relatório de Faltas", {align: "center"});
  doc.moveDown();

  dados.forEach((aluno) => {
    doc.fontSize(14).text(`${aluno.nome}: ${aluno.faltas} faltas`);
  });

  doc.end();
}

module.exports = gerarPDF;
