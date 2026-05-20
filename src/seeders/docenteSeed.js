import bcrypt from 'bcryptjs';
import db from '../models/index.js';
 
console.log('Iniciando seed...');
 
const criarDocente = async () => {
  try {
    console.log('Conectando ao banco...');
    await db.sequelize.authenticate();
    console.log('Banco conectado!');
 
    const senha = await bcrypt.hash('Andre@2026', 10);
 
    const usuario = await db.Usuario.create({
      nome_usuario: 'andre.hellvig',
      nome_completo: 'André Hellvig',
      email: 'andre.hellvig@audiosense.com',
      senha,
      tipo_usuario: 'docente',
      biografia: 'Docente de Informática.'
    });
 
    await db.UsuarioDocente.create({
      usuario_id: usuario.id,
      comprovante_vinculo: 'hellvig',
      is_admin: 0,
      status_aprovacao: 'aprovado'
    });
 
    await db.DocenteDisciplina.create({
      usuario_id: usuario.id,
      disciplina_id: 16
    });
 
    console.log('Docente criado com sucesso!');
    console.log('Email: andre.hellvig@audiosense.com');
    console.log('Senha: Andre@2026');
    process.exit(0);
 
  } catch (err) {
    console.error('Erro ao criar docente:', err);
    process.exit(1);
  }
};
 
criarDocente();