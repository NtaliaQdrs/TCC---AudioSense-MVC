import express from 'express';
const router = express.Router();
import uploadMidia from '../config/multerMidia.js';
import { inserirAudiodescricao } from '../controllers/audiodescricaoController.js';
import auth from '../middlewares/auth.js';
import { listarAudiodescricoes } from '../controllers/audiodescricaoController.js';



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Página Inicial' });
});


router.get('/audiodescricao', listarAudiodescricoes);

router.get('/deficiencia-visual', function (req, res, next) {
  res.render('deficienciaVisual', { title: 'Deficiência Visual' });
});

router.get('/inserir-audiodescricao', auth,function (req, res, next) {
  res.render('inserirAudiodescricao', { title: 'Inserir Audiodescrição' });
});

router.post('/inserir-audiodescricao', uploadMidia.single('midia'), inserirAudiodescricao);

router.get('/biblioteca', function (req, res, next) {
  res.render('biblioteca', { title: 'Biblioteca' });
});

router.get('/inserir-material', function (req, res, next) {
  res.render('inserirMaterial', { title: 'Inserir Material' });

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
