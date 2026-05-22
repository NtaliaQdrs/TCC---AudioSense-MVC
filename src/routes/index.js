import express from 'express';
const router = express.Router();

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

router.get('/biblioteca', function (req, res, next) {
  res.render('biblioteca', { title: 'Biblioteca' });
});

router.get('/formulario', function (req, res, next) {
  res.render('formulario', { title: 'Inserir Material' });

});

router.get('/configuracoes', function(req, res, next) {
  res.render('configuracoes', { title: 'Configurações' }); 
});

router.get('/entretenimento', function(req, res, next) {
  res.render('entretenimento', { title: 'Entretenimento' }); 
});

router.get('/inserir-entretenimento', function (req, res, next) {
  res.render('inserirEntretenimento', { title: 'Inserir Entretenimento' });
});

router.post('/inserir-entretenimento', function (req, res, next) {
  res.redirect('/entretenimento');
});




export default router;
