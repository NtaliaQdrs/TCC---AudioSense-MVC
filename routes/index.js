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


module.exports = router;
