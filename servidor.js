// ============================================================ //
// API do Diario de Treinos
// Back-End I - CEEP Pedro Boaretto Neto
// ============================================================ //

const express = require('express');
const app = express();
const { DatabaseSync } = require('node:sqlite');

// Faz o Express entender JSON no corpo das requisicoes
app.use(express.json());

// ------------------------------------------------------------
// Banco de Dados SQLite
// ------------------------------------------------------------
// Conecta ao banco (cria o arquivo treinos.db se nao existir)
const db = new DatabaseSync('treinos.db');

// Garante que a tabela existe
db.exec(`
CREATE TABLE IF NOT EXISTS treinos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  duracao INTEGER NOT NULL
)
`);

// ------------------------------------------------------------
// Funcoes de Validacao
// ------------------------------------------------------------
function validarTreino(corpo) {
    if (typeof corpo.nome !== 'string' || corpo.nome.trim() === '') {
        return 'O campo nome e obrigatorio e deve ser um texto.';
    }
    if (typeof corpo.duracao !== 'number' || corpo.duracao <= 0) {
        return 'O campo duracao e obrigatorio e deve ser um numero maior que zero.';
    }
    return null;
}

// Exercicio 12: Valida se o ID da URL e um numero inteiro valido
function idInvalido(id) {
    return isNaN(id) || !Number.isInteger(id) || id <= 0;
}

// ------------------------------------------------------------
// GET /treinos - lista todos com Filtros, Busca e Ordenacao (Exercicios 8, 9 e 10)
// ------------------------------------------------------------
app.get('/treinos', (req, res) => {
    const { minimo, busca } = req.query;
    let sql = 'SELECT * FROM treinos';
    const condicoes = [];
    const params = [];

    // Exercicio 8: Filtro por duracao minima (?minimo=40)
    if (minimo !== undefined && !isNaN(Number(minimo))) {
        condicoes.push('duracao >= ?');
        params.push(Number(minimo));
    }

    // Exercicio 10: Busca por nome (?busca=peito)
    if (busca) {
        condicoes.push('nome LIKE ?');
        params.push(`%${busca}%`);
    }

    if (condicoes.length > 0) {
        sql += ' WHERE ' + condicoes.join(' AND ');
    }

    // Exercicio 9: Ordenacao da maior para a menor duracao
    sql += ' ORDER BY duracao DESC';

    const treinos = db.prepare(sql).all(...params);
    res.status(200).json(treinos);
});

// ------------------------------------------------------------
// GET /treinos/total - contagem total de treinos (Exercicio 7)
// ATENCAO: Deve ser declarada ANTES de /treinos/:id
// ------------------------------------------------------------
app.get('/treinos/total', (req, res) => {
    const resultado = db.prepare('SELECT COUNT(*) AS total FROM treinos').get();
    res.status(200).json({ total: resultado.total });
});

// ------------------------------------------------------------
// GET /treinos/resumo - relatorio com total, minutos e media (Exercicio 11)
// ATENCAO: Deve ser declarada ANTES de /treinos/:id
// ------------------------------------------------------------
app.get('/treinos/resumo', (req, res) => {
    const resultado = db.prepare(`
        SELECT
            COUNT(*) AS total,
            COALESCE(SUM(duracao), 0) AS minutos,
            COALESCE(AVG(duracao), 0) AS media
        FROM treinos
    `).get();

    res.status(200).json({
        total: resultado.total,
        minutos: resultado.minutos,
        media: resultado.media
    });
});

// ------------------------------------------------------------
// GET /treinos/:id - busca um treino pelo id (400 se invalido / 404 se nao existir)
// ------------------------------------------------------------
app.get('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);

    // Exercicio 12: ID invalido responde 400
    if (idInvalido(id)) {
        return res.status(400).json({ erro: 'ID invalido.' });
    }

    const treino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
    if (treino === undefined) {
        return res.status(404).json({ erro: 'Treino nao encontrado.' });
    }
    res.status(200).json(treino);
});

// ------------------------------------------------------------
// POST /treinos - cria um treino (400 se os dados forem invalidos)
// ------------------------------------------------------------
app.post('/treinos', (req, res) => {
    const erro = validarTreino(req.body);
    if (erro !== null) {
        return res.status(400).json({ erro: erro });
    }

    // Insere no banco
    const resultado = db
        .prepare('INSERT INTO treinos (nome, duracao) VALUES (?, ?)')
        .run(req.body.nome, req.body.duracao);

    // Busca o treino recem-criado para devolver com o id gerado
    const novo = db
        .prepare('SELECT * FROM treinos WHERE id = ?')
        .get(resultado.lastInsertRowid);

    res.status(201).json(novo);
});

// ------------------------------------------------------------
// PUT /treinos/:id - substitui um treino no banco de dados
// ------------------------------------------------------------
app.put('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);

    // Exercicio 12: ID invalido responde 400
    if (idInvalido(id)) {
        return res.status(400).json({ erro: 'ID invalido.' });
    }

    const treino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
    if (treino === undefined) {
        return res.status(404).json({ erro: 'Treino nao encontrado.' });
    }

    const erro = validarTreino(req.body);
    if (erro !== null) {
        return res.status(400).json({ erro: erro });
    }

    db.prepare('UPDATE treinos SET nome = ?, duracao = ? WHERE id = ?')
        .run(req.body.nome, req.body.duracao, id);

    const atualizado = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
    res.status(200).json(atualizado);
});

// ------------------------------------------------------------
// DELETE /treinos/:id - remove um treino
// ------------------------------------------------------------
app.delete('/treinos/:id', (req, res) => {
    const id = Number(req.params.id);

    // Exercicio 12: ID invalido responde 400
    if (idInvalido(id)) {
        return res.status(400).json({ erro: 'ID invalido.' });
    }

    const treino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
    if (treino === undefined) {
        return res.status(404).json({ erro: 'Treino nao encontrado.' });
    }

    db.prepare('DELETE FROM treinos WHERE id = ?').run(id);
    res.status(204).end();
});

// ------------------------------------------------------------
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});