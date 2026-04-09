var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/cadastro', function(req, res, next) {
  res.render('cadastro', { title: 'Cadastro' }); 
});

router.get('/cadastroDocente', function(req, res, next) {
  res.render('cadastroDocente', { title: 'Cadastro de Docente' }); 
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' }); 
});



module.exports = router;
