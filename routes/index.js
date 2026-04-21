var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' }); 
});


router.get('/audiodescricao', function(req, res, next) {
  res.render('audiodescricao');
});

router.get('/cadastro', function(req, res, next) {
  res.render('cadastro', { title: 'Cadastro' }); 
});

router.get('/cadastroDocente', function(req, res, next) {
  res.render('cadastroDocente', { title: 'Cadastro de Docente' }); 
});

router.get('/cadastroDiscente', function(req, res, next) {
  res.render('cadastroDiscente', { title: 'Cadastro de Discente' }); 
});

router.get('/customizar', function(req, res, next) {
  res.render('customizar', { title: 'Customizar Perfil' }); 

});

router.get('/deficiencia-visual', function(req, res, next) {
  res.render('deficienciaVisual'); 

});


module.exports = router;
