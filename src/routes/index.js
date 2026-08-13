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
import { inserirMaterial, 
        exibirInserirMaterial, 
        listarMateriais, 
        apagarMaterial, 
        verMaterial, 
        avaliarMaterial, 
        meusMateriais } from '../controllers/materialDidaticoController.js';
import { criarUpload } from '../config/uploadService.js';

const router = express.Router();
const uploadPoster = criarUpload('posters', ['image/jpeg', 'image/png', 'image/webp']);
const uploadMaterial = criarUpload('materiais', [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'image/jpeg',
    'image/png',
    'image/webp'
]);

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

router.get('/biblioteca', listarMateriais);


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
router.get('/inserir-material', auth, exibirInserirMaterial);

router.post(
    '/inserir-material',
    auth,
    uploadMaterial.fields([
        { name: 'arquivo', maxCount: 1 },
        { name: 'audio_descricao', maxCount: 1 },
        { name: 'capa', maxCount: 1 }
        
    ]),
    inserirMaterial
);

router.get('/usuario/meus-materiais', auth, meusMateriais);

router.post('/material/:id/apagar', auth, apagarMaterial);

router.get('/material/:id', verMaterial);

router.get('/inserir-entretenimento', auth, exibirInserirEntretenimento);
router.post('/inserir-entretenimento', auth, uploadPoster.single('poster'), salvarEntretenimento);



export default router;