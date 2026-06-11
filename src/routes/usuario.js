import express from 'express';
import upload from '../config/multer.js';
import uploadComprovante from '../config/multerComprovante.js';
import auth from '../middlewares/auth.js';
import {
    // Views autenticadas
    verPerfil,
    verMinhasAudiodescricoes,
    // Actions de usuário
    cadastrarDiscente,
    cadastrarDocente,
    verCadastroDocente,
    salvarCustomizacao,
    editarPerfil,
    reenviarCadastroDocente,
    // Senha
    esqueceuSenha,
    verRedefinirSenha,
    redefinirSenha,
    // Auth
    login,
} from '../controllers/usuarioController.js';

const router = express.Router();

// ═══════════════════════════════════════════════
// PÁGINAS PÚBLICAS (sem autenticação)
// ═══════════════════════════════════════════════

// Login
router.get('/', (req, res) =>
    res.render('login', {
        title: 'Entrar',
        status: req.query.status || null,
        motivo: req.query.motivo || null,
        email:  req.query.email  || null,
    })
);

// Cadastro — escolha de tipo
router.get('/cadastro', (req, res) =>
    res.render('cadastro', { title: 'Cadastro' })
);

// Cadastro discente
router.get('/cadastro-discente', (req, res) =>
    res.render('cadastroDiscente', { title: 'Cadastro de Discente' })
);

// Cadastro docente (busca disciplinas no banco)
router.get('/cadastro-docente', verCadastroDocente);

// Customização de perfil (pós-cadastro, sem auth pois sessão ainda não foi criada)
router.get('/customizar', (req, res) =>
    res.render('customizar', { title: 'Personalizar Perfil' })
);

// Recuperação de senha
router.get('/esqueceu-senha', (req, res) =>
    res.render('esqueceuSenha', { title: 'Esqueceu a senha', mensagem: null, erro: null })
);
router.get('/redefinir-senha/:token', verRedefinirSenha);

// ═══════════════════════════════════════════════
// PÁGINAS AUTENTICADAS
// ═══════════════════════════════════════════════

router.get('/perfil',                  auth, verPerfil);
router.get('/minhas-audiodescricoes',  auth, verMinhasAudiodescricoes);
router.get('/configuracoes-perfil',    auth, (req, res) =>
    res.render('configuracoesPerfil', { title: 'Configurações da conta' })
);

// Dados do usuário em JSON (uso interno/debug)
router.get('/perfil-dados', auth, (req, res) =>
    res.json({ mensagem: 'Acesso autorizado!', usuario: req.usuario })
);

// Logout
router.get('/logout', (req, res) =>
    req.session.destroy(() => res.redirect('/usuario'))
);

// ═══════════════════════════════════════════════
// AÇÕES (POST)
// ═══════════════════════════════════════════════

// Auth
router.post('/login',            login);

// Cadastro
router.post('/cadastro-discente',        cadastrarDiscente);
router.post('/cadastro-docente',         uploadComprovante.single('comprovante'), cadastrarDocente);
router.post('/reenviar-cadastro-docente',uploadComprovante.single('comprovante'), reenviarCadastroDocente);
router.post('/customizar',               upload.single('foto'), salvarCustomizacao);

// Perfil
router.post('/editar-perfil', auth, upload.single('foto'), editarPerfil);

// Senha
router.post('/esqueceu-senha',          esqueceuSenha);
router.post('/redefinir-senha/:token',  redefinirSenha);

export default router;