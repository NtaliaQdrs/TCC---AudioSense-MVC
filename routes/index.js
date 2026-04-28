var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Página Inicial' });
});

router.get('/audiodescricao', function (req, res, next) {
  res.render('audiodescricao', { title: 'Audiodescrição' });
});

router.get('/deficiencia-visual', function (req, res, next) {
  res.render('deficienciaVisual', { title: 'Deficiência Visual' });
});

router.get('/inserir-audiodescricao', function (req, res, next) {
  res.render('inserirAudiodescricao', { title: 'Inserir Audiodescrição' });
});

router.post('/inserir-audiodescricao', function (req, res, next) {
  // Após o clique no botão de submit, o servidor redireciona o usuário
  res.redirect('/audiodescricao');
});


module.exports = router;
