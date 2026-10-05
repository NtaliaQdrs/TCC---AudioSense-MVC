import express from 'express';
import auth from '../middlewares/auth.js';
import authAdmin from '../middlewares/authAdmin.js';
import adminUsuariosController from '../controllers/adminUsuariosController.js';
import adminModeracaoController from '../controllers/adminModeracaoController.js';

const router = express.Router();

// Todas as rotas abaixo exigem: usuário logado (auth) E ser docente com
// is_admin = true (authAdmin). auth já roda antes de authAdmin porque
// authAdmin depende de req.session existir.

// ─── GESTÃO DE USUÁRIOS ────────────────────────────────────────────────
router.get('/admin/usuarios', auth, authAdmin, adminUsuariosController.listarUsuarios);
router.put('/admin/usuarios/:id', auth, authAdmin, adminUsuariosController.editarUsuario);
router.patch('/admin/usuarios/:id/banir', auth, authAdmin, adminUsuariosController.banirUsuario);
router.patch('/admin/usuarios/:id/desbanir', auth, authAdmin, adminUsuariosController.desbanirUsuario);
router.delete('/admin/usuarios/:id', auth, authAdmin, adminUsuariosController.excluirUsuario);

// ─── MODERAÇÃO DE CONTEÚDO ─────────────────────────────────────────────
router.get('/admin/moderacao/resumo', auth, authAdmin, adminModeracaoController.resumoModeracao);
router.delete('/admin/forum/:id', auth, authAdmin, adminModeracaoController.excluirPublicacao);
router.delete('/admin/materiais/:id', auth, authAdmin, adminModeracaoController.excluirMaterial);
router.delete('/admin/audiodescricoes/:id', auth, authAdmin, adminModeracaoController.excluirProjetoAudiodescricao);

export default router;