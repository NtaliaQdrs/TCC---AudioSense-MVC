import express from 'express';
import { cadastrarDiscente, login, salvarCustomizacao, verPerfil } from '../controllers/usuarioController.js';
import auth from '../middlewares/auth.js'; // importa o middleware
import upload from '../config/multer.js';

const router = express.Router();

// ==================== VIEWS ====================

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

router.get('/perfil', auth, verPerfil, function(req, res, next) {
  res.render('perfil', { title: 'Meu Perfil' });
});

// ==================== API ====================

router.post('/cadastro-discente', cadastrarDiscente);
router.post('/login', login);

// Rota de view do perfil — protegida, só acessa quem estiver logado


// Rota de API que retorna os dados do usuário logado em JSON
//router.get('/perfil-dados', auth, (req, res) => {
  //res.json({ mensagem: 'Acesso autorizado!', usuario: req.usuario });
//});

// upload.single('foto') — processa o upload do campo 'foto' do formulário
router.post('/customizar', upload.single('foto'), salvarCustomizacao);

export default router;