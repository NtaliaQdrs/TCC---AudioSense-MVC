import express from 'express';
import auth from '../middlewares/auth.js';
import { buscarNotificacoes, marcarTodasLidas, marcarNotificacaoLida } from '../controllers/notificacaoController.js';

const router = express.Router();

router.get('/', auth, buscarNotificacoes);
router.post('/marcar-lidas', auth, marcarTodasLidas);
router.post('/:id/marcar-lida', auth, marcarNotificacaoLida);

export default router;