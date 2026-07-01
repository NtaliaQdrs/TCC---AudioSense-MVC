import express from 'express';
import auth from '../middlewares/auth.js';
import uploadMidia from '../config/multerMidia.js';
import uploadAudio from '../config/multerAudio.js';
import db from '../models/index.js';

import {
    listarAudiodescricoes,
    inserirAudiodescricao,
    exibirCorrecao,
    salvarCorrecao,
    exibirAjuste,
    salvarAjuste,
    exibirEnviarMidiaFinal,
    salvarMidiaFinal,
    verAudiodescricao,
    apagarAudiodescricao,
} from '../controllers/audiodescricaoController.js';
import { verPerfil } from '../controllers/usuarioController.js';
import {
    listarEntretenimento,
    exibirInserirEntretenimento,
    salvarEntretenimento
} from '../controllers/recomendacaoController.js';
import { criarUpload } from '../config/uploadService.js';

const router = express.Router();
const uploadPoster = criarUpload('posters', ['image/jpeg', 'image/png', 'image/webp']);

// ═══════════════════════════════════════════════
// PÁGINAS PÚBLICAS / ACESSO GERAL
// ═══════════════════════════════════════════════

router.get('/', (req, res) =>
    res.render('index', { title: 'Página Inicial', usuario: req.user || null })
);
router.get('/configuracoes', (req, res) =>
    res.render('configuracoes', { title: 'Configurações', usuario: req.user || null })
);
router.get('/deficiencia-visual', (req, res) =>
    res.render('deficienciaVisual', { title: 'Deficiência Visual', usuario: req.user || null })
);
router.get('/entretenimento', listarEntretenimento);
router.get('/biblioteca', (req, res) =>
    res.render('biblioteca', { title: 'Biblioteca', usuario: req.session.usuarioLogado || null })
);

// ═══════════════════════════════════════════════
// AUDIODESCRIÇÃO
// ═══════════════════════════════════════════════

router.get('/audiodescricao', listarAudiodescricoes);

router.get('/inserir-audiodescricao', auth, (req, res) =>
    res.render('inserirAudiodescricao', { title: 'Inserir Audiodescrição', usuario: req.session.usuarioLogado || null })
);
router.post('/inserir-audiodescricao', auth, uploadMidia.single('midia'), inserirAudiodescricao);

router.post('/apagar-audiodescricao/:id', auth, apagarAudiodescricao);

router.get('/corrigir-audiodescricao/:id', auth, exibirCorrecao);
router.post('/corrigir-audiodescricao/:id', auth, salvarCorrecao);

router.get('/ajustar-audiodescricao/:id', auth, exibirAjuste);
router.post('/ajustar-audiodescricao/:id', auth, salvarAjuste);

router.get('/enviar-midia-final/:id', auth, exibirEnviarMidiaFinal);
router.post('/enviar-midia-final/:id', auth, async (req, res, next) => {
    try {
        const projeto = await db.projetoAudiodescricao.findByPk(req.params.id);
        if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado.' });
        if (projeto.tipo_midia === 'video') {
            uploadMidia.single('midia')(req, res, next);
        } else {
            uploadAudio.single('audio')(req, res, next);
        }
    } catch (err) {
        next(err);
    }
}, salvarMidiaFinal);

router.get('/ver-audiodescricao/:id', auth, verAudiodescricao);

// ═══════════════════════════════════════════════
// MATERIAIS / ENTRETENIMENTO
// ═══════════════════════════════════════════════

router.get('/inserir-material', auth, (req, res) =>
    res.render('inserirMaterial', { title: 'Inserir Material', usuario: req.session.usuarioLogado || null })
);
router.get('/inserir-entretenimento', auth, exibirInserirEntretenimento);
router.post('/inserir-entretenimento', auth, uploadPoster.single('poster'), salvarEntretenimento);

// ═══════════════════════════════════════════════
// FÓRUM
// ═══════════════════════════════════════════════

router.get('/forum', (req, res) =>
    res.render('forum', { title: 'Fórum' })
);
router.get('/inserir-topico', auth, (req, res) => {
    console.log("DADOS DO USUÁRIO NO FÓRUM:", req.session.usuarioLogado);
    res.render('inserirTopico', { title: 'Inserir Tópico', usuario: req.session.usuarioLogado || null });
});

export default router;