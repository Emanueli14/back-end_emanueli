const db = require('../banco.js');

function listarTodos() {
  return db.prepare('SELECT * FROM treinos').all();
}

function buscarPorNome(busca) {
  const termo = `%${busca}%`;
  return db.prepare('SELECT * FROM treinos WHERE nome LIKE ?').all(termo);
}

function buscarResumo() {
  return db.prepare('SELECT COUNT(*) as total, SUM(duracao) as minutos, AVG(duracao) as media FROM treinos').get();
}

function buscarPorId(id) {
  return db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
}

function inserirComId(id, nome, duracao) {
  db.prepare('INSERT INTO treinos (id, nome, duracao) VALUES (?, ?, ?)').run(id, nome, duracao);
}

function inserirSemId(nome, duracao) {
  const resultado = db.prepare('INSERT INTO treinos (nome, duracao) VALUES (?, ?)').run(nome, duracao);
  return resultado.lastInsertRowid;
}

function atualizar(id, nome, duracao) {
  db.prepare('UPDATE treinos SET nome = ?, duracao = ? WHERE id = ?').run(nome, duracao, id);
}

function deletar(id) {
  db.prepare('DELETE FROM treinos WHERE id = ?').run(id);
}

module.exports = {
  listarTodos,
  buscarPorNome,
  buscarResumo,
  buscarPorId,
  inserirComId,
  inserirSemId,
  atualizar,
  deletar
};
