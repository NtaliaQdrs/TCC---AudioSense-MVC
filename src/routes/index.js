import express from 'express';
import auth from '../middlewares/auth.js';
import uploadMidia from '../config/multerMidia.js';
import uploadAudio from '../config/multerAudio.js';

import {
    // Listagem
    listarAudiodescricoes,
    // Inserção
    inserirAudiodescricao,
    // Correção (docente)
    exibirCorrecao,
    salvarCorrecao,
    // Ajuste (discente)
    exibirAjuste,
    salvarAjuste,
    // Envio de áudio
    exibirEnviarAudio,
    salvarAudio,
    // Visualização
    verAudiodescricao,
    apagarAudiodescricao,
} from '../controllers/audiodescricaoController.js';
import {
    // Views autenticadas
    verPerfil
} from '../controllers/usuarioController.js';
import {
   listarEntretenimento,
   exibirInserirEntretenimento,
   salvarEntretenimento
 } from '../controllers/recomendacaoController.js';
import { 
    criarUpload 
} from '../config/uploadService.js';

const router = express.Router();
const uploadPoster = criarUpload('posters', ['image/jpeg', 'image/png', 'image/webp']);


// ═══════════════════════════════════════════════
// PÁGINAS PÚBLICAS / ACESSO GERAL
// ═══════════════════════════════════════════════

router.get('/', (req, res) =>
    // Passamos o req.user (se existir) para que o layout/menu saiba se o usuário está logado
    res.render('index', { title: 'Página Inicial', usuario: req.user || null })
);

router.get('/configuracoes', (req, res) =>
    res.render('configuracoes', { title: 'Configurações', usuario: req.user || null })
);

router.get('/deficiencia-visual', (req, res) =>
    res.render('deficienciaVisual', { title: 'Deficiência Visual', usuario: req.user || null })
);

router.get('/entretenimento', listarEntretenimento);

// Alterado aqui: Adicionamos o 'usuario' vindo do seu sistema de autenticação
router.get('/biblioteca', (req, res) => {
    res.render('biblioteca', { title: 'Biblioteca', usuario: req.session.usuarioLogado || null 
    });
});
// ═══════════════════════════════════════════════
// AUDIODESCRIÇÃO
// ═══════════════════════════════════════════════

router.get('/audiodescricao', listarAudiodescricoes);

// Inserir (discente)
router.get('/inserir-audiodescricao',  auth, (req, res) =>
    res.render('inserirAudiodescricao', { title: 'Inserir Audiodescrição', usuario: req.session.usuarioLogado || null })
);

router.post('/inserir-audiodescricao', auth, uploadMidia.single('midia'), inserirAudiodescricao);

router.post('/apagar-audiodescricao/:id', auth, apagarAudiodescricao);

// Correção (docente)
router.get('/corrigir-audiodescricao/:id',  auth, exibirCorrecao);
router.post('/corrigir-audiodescricao/:id', auth, salvarCorrecao);

// Ajuste (discente)
router.get('/ajustar-audiodescricao/:id',  auth, exibirAjuste);
router.post('/ajustar-audiodescricao/:id', auth, salvarAjuste);

// Envio de áudio final
router.get('/enviar-audio/:id',  auth, exibirEnviarAudio);
router.post('/enviar-audio/:id', auth, uploadAudio.single('audio'), salvarAudio);

// Visualização
router.get('/ver-audiodescricao/:id', auth, verAudiodescricao);

// ═══════════════════════════════════════════════
// MATERIAIS / ENTRETENIMENTO
// ═══════════════════════════════════════════════

router.get('/inserir-material', auth, (req, res) =>
    res.render('inserirMaterial', { title: 'Inserir Material', usuario: req.session.usuarioLogado || null })
);

router.get('/inserir-entretenimento', auth, exibirInserirEntretenimento);

router.post('/inserir-entretenimento', auth,
  uploadPoster.single('poster'),
  salvarEntretenimento
);

// ═══════════════════════════════════════════════
// FÓRUM
// ══════════════════════════════════════════════

router.get('/forum', (req, res) =>
    res.render('forum', { title: 'Fórum'})
);

router.get('/inserir-topico', auth, (req, res) => {
    // Esse log vai cuspir no seu terminal as propriedades do usuário
    console.log("DADOS DO USUÁRIO NO FÓRUM:", req.session.usuarioLogado);

    res.render('inserirTopico', { 
        title: 'Inserir Tópico', 
        usuario: req.session.usuarioLogado || null 
    });
});

export default router;