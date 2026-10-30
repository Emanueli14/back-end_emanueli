const service = require('../services/treinosService.js');
const authController = require('./authController.js'); 

function listar(req, res) {
  const treinos = service.listar(req.query.busca);
  return res.status(200).json(treinos);
}

function resumo(req, res) {
  const dadosResumo = service.obterResumo();
  return res.status(200).json(dadosResumo);
}

function buscarUm(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'O id deve ser um numero inteiro.' });
  }

  const resultado = service.buscarUm(id);
  if (resultado.naoEncontrado) {
    return res.status(404).json({ erro: 'Treino nao encontrado .' });
  }
  return res.status(200).json(resultado.treino);
}

function criar(req, res) {
  const dono = authController.usuarioDaRequisicao(req);
  if (dono === null) {
    return res.status(401).json({ erro: 'Faca login primeiro.' });
  }

  const resultado = service.criar(req.body);
  if (resultado.erro) return res.status(400).json({ erro: resultado.erro });
  return res.status(201).json(resultado.dados);
}

function atualizar(req, res) {
  const id = Number(req.params.id);
  const resultado = service.atualizar(id, req.body);
  
  if (resultado.erro) return res.status(400).json({ erro: resultado.erro });
  if (resultado.naoEncontrado) return res.status(404).json({ erro: 'Treino nao encontrado.' });
  
  return res.status(200).json(resultado.dados);
}

function remover(req, res) {
  const id = Number(req.params.id);
  const resultado = service.remover(id);
  
  if (resultado.naoEncontrado) return res.status(404).json({ erro: 'Treino nao encontrado.' });
  return res.status(204).end();
}

module.exports = { listar, resumo, buscarUm, criar, atualizar, remover };
