import express from 'express';
import auth from '../middlewares/auth.js';
import authAdmin from '../middlewares/authAdmin.js';
import {
  criarDenuncia,
  verPainelDenuncias,
  excluirConteudoDenunciado,
  manterConteudoDenunciado
} from '../controllers/denunciaController.js';

const router = express.Router();


// Links antigos de notificações de denúncia: /biblioteca/material/ID -> /material/ID
router.get('/biblioteca/material/:id', (req, res) => {
  res.redirect(`/material/${req.params.id}`);
});

// Qualquer usuário logado pode denunciar
router.post('/denuncias', auth, criarDenuncia);

// Só admin (docente com is_admin = true) enxerga e decide
router.get('/admin/denuncias', auth, authAdmin, verPainelDenuncias);
router.post('/admin/denuncias/:id/excluir', auth, authAdmin, excluirConteudoDenunciado);
router.post('/admin/denuncias/:id/manter', auth, authAdmin, manterConteudoDenunciado);

export default router;