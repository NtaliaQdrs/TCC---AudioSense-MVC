import { Router } from 'express';
import {
    listarTopicos,
    mostrarFormulario,
    criarTopico,
    verTopico,
    adicionarComentario,
    curtirTopico,
    apagarTopico
} from '../controllers/forumController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.get('/', listarTopicos);
router.get('/inserir-topico', auth, mostrarFormulario);
router.post('/criar', auth, criarTopico);
router.get('/:id', verTopico);
router.post('/:id/comentario', auth, adicionarComentario);
router.post('/:id/curtir', auth, curtirTopico);
router.post('/:id/apagar', auth, apagarTopico);

export default router;