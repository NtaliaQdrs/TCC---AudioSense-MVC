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
import usuarioRoutes from './routes/usuario.js'; // Assumindo que o arquivo é usuario.js

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '..', 'views')); // Ajustado para a pasta 'views' na raiz do projeto
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json()); // Para o express entender requisições com corpo em JSON
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Configuração da sessão — mantém o usuário logado entre requisições
app.use(session({
  secret: process.env.JWT_SECRET, // usa o mesmo secret do JWT
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // muda para true em produção com HTTPS
}));
app.use(express.static(path.join(__dirname, '..', 'public'))); // Servir arquivos estáticos da pasta 'public'
app.use(cors()); // Permite o express receber requisições HTTP de outras fontes, como o frontend

// Rotas da API
app.use('/usuario', usuarioRoutes);
app.use('/', indexRoutes);
app.use('/users', usersRoutes);
app.use('/painelAdmin1', adminRoutes);

const PORT = process.env.PORT || 3000;

const RECONSTRUIR_BANCO = false; // Mantenha como false para não recriar o banco a cada inicialização

db.sequelize.sync({ force: RECONSTRUIR_BANCO })
  .then(async() => {
    console.log("Banco de dados conectado e sincronizado com sucesso!");

    // Só liga o server se o banco de dados estiver sincronizado corretamente
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    // Se der erro no banco (senha errada, banco fora do ar), o servidor avisa e não sobe "quebrado"
    console.error("Erro fatal ao conectar no banco de dados:", err);
    process.exit(1); // Encerrar a aplicação em caso de erro fatal no banco
  });

// Catch 404 e encaminha para o error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  console.error('ERRO:', err); // adiciona essa linha
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});