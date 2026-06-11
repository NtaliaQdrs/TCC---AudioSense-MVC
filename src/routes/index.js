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
} from '../controllers/audiodescricaoController.js';

const router = express.Router();

// ═══════════════════════════════════════════════
// PÁGINAS PÚBLICAS
// ═══════════════════════════════════════════════

router.get('/', (req, res) =>
    res.render('index', { title: 'Página Inicial' })
);

router.get('/configuracoes', (req, res) =>
    res.render('configuracoes', { title: 'Configurações' })
);

router.get('/deficiencia-visual', (req, res) =>
    res.render('deficienciaVisual', { title: 'Deficiência Visual' })
);

router.get('/entretenimento', (req, res) =>
    res.render('entretenimento', { title: 'Entretenimento' })
);

router.get('/biblioteca', (req, res) =>
    res.render('biblioteca', { title: 'Biblioteca' })
);

// ═══════════════════════════════════════════════
// AUDIODESCRIÇÃO
// ═══════════════════════════════════════════════

router.get('/audiodescricao', listarAudiodescricoes);

// Inserir (discente)
router.get('/inserir-audiodescricao',  auth, (req, res) =>
    res.render('inserirAudiodescricao', { title: 'Inserir Audiodescrição' })
);
router.post('/inserir-audiodescricao', auth, uploadMidia.single('midia'), inserirAudiodescricao);

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

router.get('/inserir-material', (req, res) =>
    res.render('inserirMaterial', { title: 'Inserir Material' })
);

router.get('/inserir-entretenimento', (req, res) =>
    res.render('inserirEntretenimento', { title: 'Inserir Entretenimento' })
);
router.post('/inserir-entretenimento', (req, res) =>
    res.redirect('/entretenimento')
);

export default router;