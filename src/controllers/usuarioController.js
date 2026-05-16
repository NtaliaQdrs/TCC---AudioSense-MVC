// Controller de usuário — lógica de cadastro e login
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const Usuario = db.Usuario;
const UsuarioDiscente = db.UsuarioDiscente;

// CADASTRO DISCENTE — cria o usuário base e o vínculo na tabela usuario_discente
export const cadastrarDiscente = async (req, res) => {
    try {
        const { nome_completo, email, senha } = req.body;

        // Verifica se o email já está cadastrado
        const emailExistente = await Usuario.findOne({ where: { email } });
        if (emailExistente) {
            return res.status(400).json({ erro: 'Email já cadastrado.' });
        }

        // Criptografa a senha antes de salvar
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Cria o usuário base
        const novoUsuario = await Usuario.create({
            nome_completo,
            email,
            senha: senhaCriptografada,
            tipo_usuario: 'discente'
        });

        // Cria o vínculo na tabela usuario_discente
        await UsuarioDiscente.create({
            usuario_id: novoUsuario.id
        });

        // Salva o id do usuário na sessão para usar na tela de customização
        req.session.usuarioId = novoUsuario.id;

        // Redireciona para a tela de customização de perfil
        return res.redirect('/usuario/customizar');

    } catch (err) {
        console.error('Erro no cadastro de discente:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// LOGIN — verifica email e senha e retorna um token JWT
export const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Busca o usuário pelo email
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(401).json({ erro: 'Email ou senha inválidos.' });
        }

        // Compara a senha digitada com o hash salvo no banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Email ou senha inválidos.' });
        }

        // Gera o token JWT com os dados básicos do usuário
        const token = jwt.sign(
            { id: usuario.id, tipo_usuario: usuario.tipo_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Token válido por 8 horas
        );

        req.session.usuarioLogado = { id: usuario.id, tipo_usuario: usuario.tipo_usuario };

        // Se for requisição do navegador, redireciona para o perfil
        if (req.accepts('html')) {
            return res.redirect('/usuario/perfil');
        }

        // Se for API, retorna o token
        return res.status(200).json({ mensagem: 'Login realizado com sucesso!', token });

    } catch (err) {
        console.error('Erro no login:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// CUSTOMIZAR PERFIL — salva nome_usuario, biografia e foto de perfil
export const salvarCustomizacao = async (req, res) => {
    try {
        console.log('BODY:', req.body);
        console.log('FILE:', req.file);
        console.log('SESSION:', req.session);

        // Pega o id do usuário salvo na sessão durante o cadastro
        const usuarioId = req.session.usuarioId;

        if (!usuarioId) {
            return res.redirect('/usuario'); // Se não tiver sessão, manda pro login
        }

        const { nome_usuario, biografia } = req.body;

        // Verifica se o nome de usuário já está em uso
        const nomeExistente = await Usuario.findOne({ where: { nome_usuario } });
        if (nomeExistente) {
            return res.status(400).json({ erro: 'Nome de usuário já está em uso.' });
        }

        // Atualiza o usuário com os dados de customização
        await Usuario.update(
            {
                nome_usuario,
                biografia,
                foto_perfil: req.file ? req.file.filename : null
            },
            { where: { id: usuarioId } }
        );

        // Limpa o id da sessão de cadastro
        req.session.usuarioId = null;

        // Redireciona para a página inicial do sistema
        return res.redirect('/');

    } catch (err) {
        console.error('Erro na customização:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// VER PERFIL — busca os dados do usuário logado e passa para a view
export const verPerfil = async (req, res) => {
    try {
        // req.usuario vem do middleware auth (token JWT decodificado)
        const usuario = await Usuario.findOne({
            where: { id: req.usuario.id },
            attributes: ['id', 'nome_completo', 'nome_usuario', 'email', 'biografia', 'foto_perfil', 'tipo_usuario', 'data_cadastro']
        });

        if (!usuario) {
            return res.redirect('/usuario');
        }

        // Formata a data de cadastro
        const dataCadastro = new Date(usuario.data_cadastro);
        const membroDesde = dataCadastro.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

        return res.render('perfil', {
            title: 'Meu Perfil',
            usuario: usuario.toJSON(),
            membroDesde
        });

    } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};