const authController = require('./authController.js');

function criar(req, res) {
  const dono = authController.usuarioDaRequisicao(req);
  if (dono === null) {
    return res.status(401).json({ erro: 'Faca login primeiro.' });
  }

}
