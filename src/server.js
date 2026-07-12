import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import createError from './utils/createError.js';
import db from './models/index.js';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importa as rotas que existem
import indexRoutes from './routes/index.js'; 
import usersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import usuarioRoutes from './routes/usuario.js';
import estatisticaRoutes from './routes/estatistica.js';
import notificacaoRoutes from './routes/notificacao.js';

const app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cors());

app.use((req, res, next) => {
  res.locals.usuarioLogado = req.session.usuarioLogado || null;
  next();
});

app.use('/usuario', usuarioRoutes);
app.use('/', indexRoutes);
app.use('/users', usersRoutes);
app.use('/painelAdmin1', adminRoutes);
app.use('/estatisticas', estatisticaRoutes);
app.use('/notificacoes', notificacaoRoutes);

const PORT = process.env.PORT || 3000;
const RECONSTRUIR_BANCO = false;

db.sequelize.sync({ force: RECONSTRUIR_BANCO })
  .then(async() => {
    console.log("Banco de dados conectado e sincronizado com sucesso!");
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro fatal ao conectar no banco de dados:", err);
    process.exit(1);
  });

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error('ERRO:', err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});