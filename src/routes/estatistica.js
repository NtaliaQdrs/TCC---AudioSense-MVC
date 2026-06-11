import express from 'express';
import estatisticaController from '../controllers/estatisticaController.js'; 


const router = express.Router();

// URL: /api/estatisticas/discentes
router.get('/contar-discentes', estatisticaController.contarDiscentes);

// URL: /api/estatisticas/docentes
router.get('/contar-docentes', estatisticaController.contarDocentes);


export default router;
