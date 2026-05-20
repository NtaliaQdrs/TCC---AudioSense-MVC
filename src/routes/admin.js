import express from 'express';
import auth from '../middlewares/auth.js';
import authAdmin from '../middlewares/authAdmin.js';
import { verPainelAdmin, aprovarDocente, rejeitarDocente, aprovarSolicitacaoAdmin, 
  rejeitarSolicitacaoAdmin, enviarSolicitacaoAdmin, verPainelDocente } from '../controllers/adminController.js';

const router = express.Router();

router.get('/', auth, verPainelDocente);
router.get('/painel-admin', authAdmin, verPainelAdmin);

router.post('/aprovar/:docente_id', authAdmin, aprovarDocente);
router.post('/rejeitar/:docente_id', authAdmin, rejeitarDocente);
router.post('/solicitar-admin', auth, enviarSolicitacaoAdmin);
router.post('/aprovar-admin/:solicitacao_id', authAdmin, aprovarSolicitacaoAdmin);
router.post('/rejeitar-admin/:solicitacao_id', authAdmin, rejeitarSolicitacaoAdmin);

export default router;