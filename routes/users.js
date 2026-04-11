var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
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


module.exports = router;
