import express from 'express';
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('painelAdmin1', { title: 'Painel de Administração' });
});



export default router;