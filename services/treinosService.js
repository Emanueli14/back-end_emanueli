const repository = require('../repositories/treinosRepository.js');

function validarTreino(corpo) {
  if (typeof corpo.nome !== 'string' || corpo.nome.trim() === '') return 'O campo nome e obrigatorio e deve ser um texto .!';
  if (typeof corpo.duracao !== 'number' || corpo.duracao <= 0) {
    return 'O campo duracao e obrigatorio e deve ser um numero maior que zero .';
  }
  return null;
}

function listar(busca) {
  if (busca) return repository.buscarPorNome(busca);
  return repository.listarTodos();
}

function obterResumo() {
  const resumo = repository.buscarResumo();
  return {
    total: resumo.total || 0,
    minutos: resumo.minutos || 0,
    media: resumo.media || 0
  };
}

function buscarUm(id) {
  const treino = repository.buscarPorId(id);
  if (treino === undefined) return { naoEncontrado: true };
  return { treino };
}

function criar(corpoRequisicao) {
  const listaTreinos = Array.isArray(corpoRequisicao) ? corpoRequisicao : [corpoRequisicao];
  
  for (const t of listaTreinos) {
    const erro = validarTreino(t);
    if (erro !== null) return { erro: `Erro no treino: ${erro}` };
  }

  const resultados = [];
  for (const t of listaTreinos) {
    let idGerado;
    if (t.id) {
      repository.inserirComId(t.id, t.nome, t.duracao);
      idGerado = t.id;
    } else {
      idGerado = repository.inserirSemId(t.nome, t.duracao);
    }
    resultados.push(repository.buscarPorId(idGerado));
  }

  return { dados: Array.isArray(corpoRequisicao) ? resultados : resultados[0] };
}

function atualizar(id, corpo) {
  const erro = validarTreino(corpo);
  if (erro !== null) return { erro };

  const treinoExistente = repository.buscarPorId(id);
  if (treinoExistente === undefined) return { naoEncontrado: true };

  repository.atualizar(id, corpo.nome, corpo.duracao);
  return { dados: repository.buscarPorId(id) };
}

function remover(id) {
  const treino = repository.buscarPorId(id);
  if (treino === undefined) return { naoEncontrado: true };

  repository.deletar(id);
  return { sucesso: true };
}

module.exports = { listar, obterResumo, buscarUm, criar, atualizar, remover };
