const open = require("open"); // npm install open

function enviarMensagem(aluno, mensagem) {
  if (!aluno.whatsapp) return console.log("Aluno sem WhatsApp cadastrado.");

  const numero = aluno.whatsapp.replace(/\D/g,''); // só números
  const url = `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensagem)}`;

  open(url);
  console.log(`Mensagem pronta para ${aluno.nome} enviar no WhatsApp.`);
}

module.exports = enviarMensagem;
