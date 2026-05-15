import express from 'express';
const router = express.Router();


router.get('/', function(req, res, next) {
  res.render('login', { title: 'Página de Login' }); 
});

router.get('/cadastro', function(req, res, next) {
  res.render('cadastro', { title: 'Página de Cadastro' }); 
});

router.get('/cadastro-docente', function(req, res, next) {
  res.render('cadastroDocente', { title: 'Página de Cadastro de Docente' }); 
});

router.get('/cadastro-discente', function(req, res, next) {
  res.render('cadastroDiscente', { title: 'Página de Cadastro de Discente' }); 
});

router.get('/customizar', function(req, res, next) {
  res.render('customizar', { title: 'Página de Customização de Perfil' }); 
});

router.get('/configuracoes', function(req, res, next) {
  res.render('configuracoes', { title: 'Configurações' }); 
});

export default router;