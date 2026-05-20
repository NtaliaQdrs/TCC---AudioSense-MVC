import express from 'express';
import { cadastrarDiscente, cadastrarDocente, login, salvarCustomizacao, verPerfil, verCadastroDocente, editarPerfil } from '../controllers/usuarioController.js';
import auth from '../middlewares/auth.js'; // importa o middleware
import upload from '../config/multer.js';
import uploadComprovante from '../config/multerComprovante.js';

const router = express.Router();

// ==================== VIEWS ====================

router.get('/', function (req, res, next) {
  res.render('login', { title: 'Página de Login' });
});

router.get('/cadastro', function (req, res, next) {
  res.render('cadastro', { title: 'Página de Cadastro' });
});

router.get('/cadastro-docente', verCadastroDocente); // precisa buscar as disciplinas no banco antes de renderizar, por isso precisa de um controller no GET.

router.get('/cadastro-discente', function (req, res, next) {
  res.render('cadastroDiscente', { title: 'Página de Cadastro de Discente' });
});

router.get('/customizar', function (req, res, next) {
  res.render('customizar', { title: 'Página de Customização de Perfil' });
});

router.get('/configuracoes-perfil', function (req, res, next) {
  res.render('configuracoesPerfil', { title: 'Configurações da conta' });
});

router.get('/perfil', auth, verPerfil, function (req, res, next) {
  res.render('perfil', { title: 'Meu Perfil' });
});

// Rota de API que retorna os dados do usuário logado em JSON
router.get('/perfil-dados', auth, (req, res) => {
  res.json({ mensagem: 'Acesso autorizado!', usuario: req.usuario });
});

// Logout — destroi a sessão e redireciona para o login
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/usuario');
  });
});

// ==================== API ====================

router.post('/cadastro-discente', cadastrarDiscente);
router.post('/login', login);
router.post('/editar-perfil', auth, upload.single('foto'), editarPerfil);
// upload.single('foto') — processa o upload do campo 'foto' do formulário
router.post('/customizar', upload.single('foto'), salvarCustomizacao);
router.post('/cadastro-docente', uploadComprovante.single('comprovante'), cadastrarDocente);



export default router;