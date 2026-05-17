import bcrypt from 'bcryptjs';
import db from '../models/index.js';

console.log('Iniciando seed...');

const criarAdmin = async () => {
  try {
    console.log('Conectando ao banco...');
    await db.sequelize.authenticate();
    console.log('Banco conectado!');

    // Criptografa a senha
    const senha = await bcrypt.hash('Admin@2026', 10);

    // Cria o usuário base
    const usuario = await db.Usuario.create({
      nome_usuario: 'audiosense_admin',
      nome_completo: 'Administradora AudioSense',
      email: 'admin@audiosense.com',
      senha,
      tipo_usuario: 'docente',
      biografia: 'Administradora da plataforma AudioSense.'
    });

    // Cria o vínculo docente com is_admin = 1 e status aprovado
    await db.UsuarioDocente.create({
      usuario_id: usuario.id,
      comprovante_vinculo: 'admin',
      is_admin: 1,
      status_aprovacao: 'aprovado'
    });

    console.log('Admin criado com sucesso!');
    console.log('Email: admin@audiosense.com');
    console.log('Senha: Admin@2026');
    process.exit(0);

  } catch (err) {
    console.error('Erro ao criar admin:', err);
    process.exit(1);
  }
};

criarAdmin();