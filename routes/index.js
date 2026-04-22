var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/audiodescricao', function (req, res, next) {
  res.render('audiodescricao');
});

router.get('/deficiencia-visual', function (req, res, next) {
  res.render('deficienciaVisual');
});


module.exports = router;
