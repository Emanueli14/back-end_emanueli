// ============================================================
// API do Diario de Treinos
// Back-End I - CEEP Pedro Boaretto Neto
// ============================================================
// Este arquivo esta quase vazio DE PROPOSITO.
// Hoje voce vai escrever as rotas, uma de cada vez, conferindo
// no testes.http se cada uma responde o status certo.
// O que cada rota deve fazer esta no README.md.
// ============================================================

const express = require('express');
const app = express();

// Faz o Express entender JSON no corpo das requisicoes
app.use(express.json());

// ------------------------------------------------------------
// Os dados moram aqui, na memoria. Somem quando o servidor cai.
// (Na Aula 03 isso vira banco de dados.)
// ------------------------------------------------------------
// [PROF] O array ja comeca com um treino de id 1 e o proximoId tambem eh 1. O primeiro POST vai criar outro treino com id 1. Deixa o array vazio.
const treinos = [{ id: 1, nome: 'Treino A', duracao: 30 }];
let proximoId = 1;

// ------------------------------------------------------------
// Validacao
// Escreva a funcao validarTreino(corpo), que devolve a mensagem
// de erro quando algo esta errado, ou null quando esta tudo certo.
// ------------------------------------------------------------
var validarTreino = (corpo) => {
    if (typeof corpo.nome !== 'string' || corpo.nome.trim() === '') {
        return 'O campo "nome" deve ser obrigatorio';
    }
    if (typeof corpo.duracao !== 'number' || corpo.duracao <= 0) {
        return 'O campo "duracao" deve ser obrigatorio e maior que zero';
    }
    return null;
};

// ------------------------------------------------------------
// GET /treinos - lista todos os treinos
// ------------------------------------------------------------
app.get('/treinos', (req, res) => {
    res.status(200).json(treinos);
});

// ------------------------------------------------------------
// GET /treinos/:id - busca um treino pelo id (404 se nao existir)
// ------------------------------------------------------------
app.get('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);
    const treino = treinos.find((t) => t.id === id);
    if (treino === undefined) {
        // [PROF] O README pede o campo erro, nao error. Isso derruba 3 testes, confere em todas as respostas de erro.
        return res.status(404).json({ error: 'Treino nao encontrado' });
    }
    res.status(200).json(treino);
});

// ------------------------------------------------------------
// POST /treinos - cria um treino (400 se os dados forem invalidos)
// ------------------------------------------------------------
app.post('/treinos', (req, res) => {
    const erro = validarTreino(req.body);
    if (erro !== null) {
        // [PROF] erro, nao error.
        return res.status(400).json({ error: erro });
    }
    const treino = {id: proximoId,
        nome: req.body.nome,
        // [PROF] O treino so tem nome e duracao. Esse campo data nao existe no README.
        data: req.body.data,
        duracao: req.body.duracao,
    };
    proximoId=proximoId + 1;
    treinos.push(treino);
    res.status(201).json(treino);
});
       
// ------------------------------------------------------------
// PUT /treinos/:id - substitui um treino
// ------------------------------------------------------------
app.put('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);
    const trino = treinos.find((t) => t.id === id);
    if (trino === undefined) {
        // [PROF] erro, nao error.
        return res.status(404).json({ error: 'Treino nao encontrado' });
    }
    const erro = validarTreino(req.body);
    // [PROF] Essa condicao ta invertida: do jeito que ta, quando os dados estao CERTOS voce responde 400. E faltou o return.
    if (erro === null) {
        res.status(400).json({ erro: erro });
    }
    trino.nome = req.body.nome;
    trino.duracao = req.body.duracao;
    res.status(200).json(trino);
});
  

// ------------------------------------------------------------
// DELETE /treinos/:id - remove um treino
// ------------------------------------------------------------
app.delete('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);
    const posicao = treinos.findIndex((t) => t.id === id);
    if (posicao === -1) {
        // [PROF] erro, nao error.
        return res.status(404).json({ error: 'Treino nao encontrado' });
    }
    treinos.splice(posicao, 1);
    res.status(204).end();
});

// ------------------------------------------------------------
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});