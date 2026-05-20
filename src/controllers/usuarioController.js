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

        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(401).json({ erro: 'Email ou senha inválidos.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Email ou senha inválidos.' });
        }

        // Declara docente fora do if para usar depois
        let docente = null;

        if (usuario.tipo_usuario === 'docente') {
            docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuario.id } });
            if (!docente || docente.status_aprovacao === 'pendente') {
                return res.redirect('/usuario?status=pendente');
            }
            if (docente.status_aprovacao === 'rejeitado') {
                const motivo = encodeURIComponent(docente.motivo_rejeicao || 'Sem motivo informado.');
                const emailEnc = encodeURIComponent(usuario.email);
                return res.redirect(`/usuario?status=rejeitado&motivo=${motivo}&email=${emailEnc}`);
            }
        }

        // Salva na sessão incluindo is_admin se for docente
        req.session.usuarioLogado = {
            id: usuario.id,
            tipo_usuario: usuario.tipo_usuario,
            is_admin: docente ? docente.is_admin : 0
        };

        // Gera o token JWT
        const token = jwt.sign(
            { id: usuario.id, tipo_usuario: usuario.tipo_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        if (req.accepts('html')) {
            return res.redirect('/usuario/perfil');
        }

        return res.status(200).json({ mensagem: 'Login realizado com sucesso!', token });

    } catch (err) {
        console.error('Erro no login:', err.message, err.stack);
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
        const usuario = await Usuario.findOne({
            where: { id: req.usuario.id },
            attributes: ['id', 'nome_completo', 'nome_usuario', 'email', 'biografia', 'foto_perfil', 'tipo_usuario', 'data_cadastro', 'ultima_troca_nome']
        });

        if (!usuario) {
            return res.redirect('/usuario');
        }

        const dataCadastro = new Date(usuario.data_cadastro);
        const membroDesde = dataCadastro.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

        // Busca as disciplinas se for docente
        let disciplinas = [];
        if (usuario.tipo_usuario === 'docente') {
            disciplinas = await db.sequelize.query(`
        SELECT d.titulo
        FROM disciplina d
        INNER JOIN docente_disciplina dd ON d.id = dd.disciplina_id
        INNER JOIN usuario_docente ud ON dd.docente_id = ud.id
        WHERE ud.usuario_id = :usuarioId
      `, {
                replacements: { usuarioId: usuario.id },
                type: db.Sequelize.QueryTypes.SELECT
            });
        }

        // Verifica se pode trocar o nome de usuário
        let podeTrocarNome = true;
        let diasRestantes = 0;
        if (usuario.ultima_troca_nome) {
            const diasPassados = Math.floor((new Date() - new Date(usuario.ultima_troca_nome)) / (1000 * 60 * 60 * 24));
            if (diasPassados < 30) {
                podeTrocarNome = false;
                diasRestantes = 30 - diasPassados;
            }
        }

        return res.render('perfil', {
            title: 'Meu Perfil',
            usuario: usuario.toJSON(),
            membroDesde,
            disciplinas,
            podeTrocarNome,
            diasRestantes
        });

    } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

export const verCadastroDocente = async (req, res) => {
    try {
        const disciplinas = await db.sequelize.query(
            'SELECT id, titulo FROM disciplina ORDER BY CASE WHEN titulo = "Outra" THEN 1 ELSE 0 END, titulo',
            { type: db.Sequelize.QueryTypes.SELECT }
        );

        // Verifica se veio da tela de rejeição
        const emailRejeitado = req.query.email || null;
        let cadastroRejeitado = null;

        if (emailRejeitado) {
            const usuario = await Usuario.findOne({ where: { email: emailRejeitado } });
            if (usuario) {
                cadastroRejeitado = await db.UsuarioDocente.findOne({
                    where: { usuario_id: usuario.id, status_aprovacao: 'rejeitado' }
                });
            }
        }

        return res.render('cadastroDocente', {
            title: 'Cadastro de Docente',
            disciplinas,
            cadastroRejeitado: !!cadastroRejeitado,
            emailRejeitado,
            erro: req.query.erro || null  // adiciona essa linha
        });

    } catch (err) {
        console.error('Erro ao carregar disciplinas:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// CADASTRO DOCENTE — cria o usuário base, o vínculo docente e a disciplina
export const cadastrarDocente = async (req, res) => {
    try {
        const { nome_completo, email, senha, disciplina_outra, informacao_adicional } = req.body;

        // Valida disciplinas ANTES de criar qualquer coisa
        let disciplinaIds = req.body['disciplina_ids'];
        if (!disciplinaIds) {
            return res.redirect('/usuario/cadastro-docente?erro=disciplina');
        }
        if (!Array.isArray(disciplinaIds)) {
            disciplinaIds = [disciplinaIds];
        }

        // Verifica se o email já está cadastrado
        const emailExistente = await Usuario.findOne({ where: { email } });
        if (emailExistente) {
            return res.redirect('/usuario/cadastro-docente?erro=email');
        }

        // Criptografa a senha
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Cria o usuário base
        const novoUsuario = await Usuario.create({
            nome_completo,
            email,
            senha: senhaCriptografada,
            tipo_usuario: 'docente'
        });

        // Cria o vínculo na tabela usuario_docente — status começa como pendente
        const novoDocente = await db.UsuarioDocente.create({
            usuario_id: novoUsuario.id,
            comprovante_vinculo: req.file ? req.file.filename : null,
            informacao_adicional: informacao_adicional || null,
            status_aprovacao: 'pendente'
        });

        // Se selecionou "Outra", cria a nova disciplina no banco
        const idsFinais = [];
        for (const id of disciplinaIds) {
            if (id === 'outra' && disciplina_outra && disciplina_outra.trim() !== '') {
                const [novaDisciplinaId] = await db.sequelize.query(
                    `INSERT INTO disciplina (titulo) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
                    { replacements: [disciplina_outra.trim()], type: db.Sequelize.QueryTypes.INSERT }
                );
                idsFinais.push(novaDisciplinaId);
            } else if (id !== 'outra') {
                idsFinais.push(id);
            }
        }

        // Cria o vínculo para cada disciplina selecionada
        for (const disciplinaId of idsFinais) {
            await db.DocenteDisciplina.create({
                docente_id: novoDocente.id,
                disciplina_id: disciplinaId
            });
        }

        // Salva o id na sessão para a etapa de customização
        req.session.usuarioId = novoUsuario.id;

        return res.redirect('/usuario/customizar');

    } catch (err) {
        console.error('Erro no cadastro de docente:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// EDITAR PERFIL — atualiza nome_usuario, biografia e foto
export const editarPerfil = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { nome_usuario, biografia } = req.body;

        const usuario = await Usuario.findOne({ where: { id: usuarioId } });

        // Verifica limitação de 30 dias para troca de nome
        const atualizacao = { biografia };

        if (nome_usuario && nome_usuario !== usuario.nome_usuario) {
            const ultimaTroca = usuario.ultima_troca_nome;
            if (ultimaTroca) {
                const diasPassados = Math.floor((new Date() - new Date(ultimaTroca)) / (1000 * 60 * 60 * 24));
                if (diasPassados < 30) {
                    return res.status(400).json({ erro: `Você só pode trocar o nome de usuário em ${30 - diasPassados} dias.` });
                }
            }

            // Verifica se o nome já está em uso
            const nomeExistente = await Usuario.findOne({ where: { nome_usuario } });
            if (nomeExistente && nomeExistente.id !== usuarioId) {
                return res.status(400).json({ erro: 'Nome de usuário já está em uso.' });
            }

            atualizacao.nome_usuario = nome_usuario;
            atualizacao.ultima_troca_nome = new Date();
        }

        if (req.file) {
            atualizacao.foto_perfil = req.file.filename;
        }

        await Usuario.update(atualizacao, { where: { id: usuarioId } });

        return res.redirect('/usuario/perfil');

    } catch (err) {
        console.error('Erro ao editar perfil:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// REENVIAR CADASTRO DOCENTE — reseta status para pendente com novo comprovante
export const reenviarCadastroDocente = async (req, res) => {
    try {
        const { email, informacao_adicional } = req.body;

        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        const docente = await db.UsuarioDocente.findOne({
            where: { usuario_id: usuario.id, status_aprovacao: 'rejeitado' }
        });

        if (!docente) {
            return res.status(400).json({ erro: 'Nenhum cadastro rejeitado encontrado.' });
        }

        // Atualiza o comprovante e reseta o status
        await db.UsuarioDocente.update(
            {
                comprovante_vinculo: req.file ? req.file.filename : docente.comprovante_vinculo,
                informacao_adicional: informacao_adicional || docente.informacao_adicional,
                status_aprovacao: 'pendente',
                motivo_rejeicao: null
            },
            { where: { id: docente.id } }
        );

        return res.redirect('/usuario?status=pendente');

    } catch (err) {
        console.error('Erro ao reenviar cadastro:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};