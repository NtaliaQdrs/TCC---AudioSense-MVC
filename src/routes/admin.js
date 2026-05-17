import express from 'express';
import auth from '../middlewares/auth.js';
import authAdmin from '../middlewares/authAdmin.js';
import { verPainelAdmin, aprovarDocente, rejeitarDocente } from '../controllers/adminController.js';

const router = express.Router();

// Painel 1 — solicitação de acesso admin (só docentes aprovados)
router.get('/', auth, function(req, res, next) {
  res.render('painelAdmin1', { title: 'Painel de Administração' });
});

// Painel 2 — moderação (só admins)
router.get('/painel-admin', authAdmin, verPainelAdmin);

// Aprovar docente
router.post('/aprovar/:docente_id', authAdmin, aprovarDocente);

// Rejeitar docente
router.post('/rejeitar/:docente_id', authAdmin, rejeitarDocente);

export default router;