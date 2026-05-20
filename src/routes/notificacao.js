import express from 'express';
import auth from '../middlewares/auth.js';
import { buscarNotificacoes, marcarTodasLidas } from '../controllers/notificacaoController.js';

const router = express.Router();

router.get('/', auth, buscarNotificacoes);
router.post('/marcar-lidas', auth, marcarTodasLidas);

export default router;