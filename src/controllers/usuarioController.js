// Controller de usuário — lógica de cadastro e login
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import crypto from 'crypto';
import { enviarEmail } from '../config/email.js';


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

        // Salva os dados temporariamente na sessão — usuário ainda não criado
        req.session.cadastroPendente = {
            nome_completo,
            email,
            senha: senhaCriptografada,
            tipo_usuario: 'discente'
        };

        // Redireciona para a tela de customização
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
            if (req.accepts('html')) return res.redirect('/usuario?erro=credenciais');
            return res.status(401).json({ erro: 'Email ou senha inválidos.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            if (req.accepts('html')) return res.redirect('/usuario?erro=credenciais');
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

        // Se marcou "manter conectado", expira em 30 dias
        if (req.body.manterConectado) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dias em ms
        } else {
            req.session.cookie.expires = false; // expira ao fechar o navegador
        }

        // Salva na sessão incluindo is_admin se for docente
        req.session.usuarioLogado = {
            id: usuario.id,
            tipo_usuario: usuario.tipo_usuario,
            is_admin: docente ? docente.is_admin : 0,
            nome_usuario: usuario.nome_usuario,
            foto_perfil: usuario.foto_perfil || null
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
        const { nome_usuario, biografia } = req.body;

        // Verifica se tem cadastro pendente na sessão (novo usuário)
        if (req.session.cadastroPendente) {
            const { nome_completo, email, senha, tipo_usuario } = req.session.cadastroPendente;

            // Verifica se o nome de usuário já está em uso
            const nomeExistente = await Usuario.findOne({ where: { nome_usuario } });
            if (nomeExistente) {
                return res.status(400).json({ erro: 'Nome de usuário já está em uso.' });
            }

            // Cria o usuário agora
            const novoUsuario = await Usuario.create({
                nome_completo,
                email,
                senha,
                tipo_usuario,
                nome_usuario,
                biografia,
                foto_perfil: req.file ? `${process.env.R2_PUBLIC_URL}/${req.file.key}` : null
            });

            // Se for discente, cria o vínculo
            if (tipo_usuario === 'discente') {
                await UsuarioDiscente.create({ usuario_id: novoUsuario.id });
            }

            // Limpa o cadastro pendente da sessão
            req.session.cadastroPendente = null;

            return res.redirect('/usuario');
        }

        // Fluxo normal — usuário já existe, só atualiza
        const usuarioId = req.session.usuarioId;
        if (!usuarioId) {
            return res.redirect('/usuario');
        }

        const nomeExistente = await Usuario.findOne({ where: { nome_usuario } });
        if (nomeExistente) {
            return res.status(400).json({ erro: 'Nome de usuário já está em uso.' });
        }

        await Usuario.update(
            {
                nome_usuario,
                biografia,
                foto_perfil: req.file ? `${process.env.R2_PUBLIC_URL}/${req.file.key}` : null
            },
            { where: { id: usuarioId } }
        );

        req.session.usuarioId = null;
        return res.redirect('/');

    } catch (err) {
        console.error('Erro na customização:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};
// VER PERFIL — busca os dados do usuário logado e passa para a view
// VER PERFIL — busca os dados do usuário logado e passa para a view
export const verPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findOne({
            where: { id: req.usuario.id },
            attributes: ['id', 'nome_completo', 'nome_usuario', 'email', 'biografia', 'foto_perfil', 'tipo_usuario', 'data_cadastro', 'ultima_troca_nome']
        });

        if (!usuario) return res.redirect('/usuario');

        let is_admin = false;

        if (usuario.tipo_usuario === 'docente') {
            const docente = await db.UsuarioDocente.findOne({
                where: { usuario_id: usuario.id }
            });

            is_admin = !!docente?.is_admin;
        }

        const dataCadastro = new Date(usuario.data_cadastro);
        const membroDesde = dataCadastro.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

        let disciplinas = [];
        if (usuario.tipo_usuario === 'docente') {
            disciplinas = await db.sequelize.query(`
                SELECT d.titulo FROM disciplina d
                INNER JOIN docente_disciplina dd ON d.id = dd.disciplina_id
                INNER JOIN usuario_docente ud ON dd.docente_id = ud.id
                WHERE ud.usuario_id = :usuarioId
            `, { replacements: { usuarioId: usuario.id }, type: db.Sequelize.QueryTypes.SELECT });
        }

        let podeTrocarNome = true;
        let diasRestantes = 0;
        if (usuario.ultima_troca_nome) {
            const diasPassados = Math.floor((new Date() - new Date(usuario.ultima_troca_nome)) / (1000 * 60 * 60 * 24));
            if (diasPassados < 30) { podeTrocarNome = false; diasRestantes = 30 - diasPassados; }
        }

        // Busca audiodescrições do usuário
        let audiodescricoes = [];
        if (usuario.tipo_usuario === 'discente') {
            const discente = await db.UsuarioDiscente.findOne({ where: { usuario_id: usuario.id } });
            if (discente) {
                audiodescricoes = await db.projetoAudiodescricao.findAll({
                    where: { discente_id: discente.id },
                    order: [['data_submissao', 'DESC']]
                });
            }
        } else if (usuario.tipo_usuario === 'docente') {
            const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuario.id } });
            if (docente) {
                audiodescricoes = await db.projetoAudiodescricao.findAll({
                    where: { docente_id: docente.id },
                    order: [['data_submissao', 'DESC']]
                });
            }
        }


        // Busca postagens do fórum feitas pelo usuário
        const postagensForumRaw = await db.Publicacao.findAll({
            where: { usuario_id: usuario.id },
            include: [{ model: db.Comentario, as: 'comentarios', attributes: ['id'] }],
            order: [['data_postagem', 'DESC']]
        });

        const postagensForum = postagensForumRaw.map(topico => {
            const dados = topico.toJSON();
            dados.corpo_texto_curto = dados.corpo_texto.length > 100
                ? dados.corpo_texto.slice(0, 100) + '...'
                : dados.corpo_texto;
            return dados;
        });

        // Busca materiais didáticos publicados pelo docente
        let materiais = [];
        if (usuario.tipo_usuario === 'docente') {
            const docenteMaterial = await db.UsuarioDocente.findOne({ where: { usuario_id: usuario.id } });
            if (docenteMaterial) {
                const materiaisRaw = await db.MaterialDidatico.findAll({
                    where: { docente_id: docenteMaterial.id },
                    order: [['data_publicacao', 'DESC']]
                });
                materiais = materiaisRaw.map(m => m.toJSON());
            }
        }

        return res.render('perfil', {
            title: 'Meu Perfil',
            usuario: usuario.toJSON(),
            membroDesde,
            disciplinas,
            podeTrocarNome,
            diasRestantes,
            audiodescricoes,
            postagensForum,
            materiais,
            is_admin
        });

    } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

export const verCadastroDocente = async (req, res) => {
    try {
        const disciplinas = await db.sequelize.query(
            `SELECT id, titulo FROM disciplina ORDER BY CASE WHEN titulo = 'Outra' THEN 1 ELSE 0 END, titulo`,
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
            erro: req.query.erro || null
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
            comprovante_vinculo: req.file ? `${process.env.R2_PUBLIC_URL}/${req.file.key}` : null,
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
            atualizacao.foto_perfil = `${process.env.R2_PUBLIC_URL}/${req.file.key}`;
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
                comprovante_vinculo: req.file ? `${process.env.R2_PUBLIC_URL}/${req.file.key}` : docente.comprovante_vinculo,
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

// ESQUECEU SENHA — envia email com link de redefinição
export const esqueceuSenha = async (req, res) => {
    try {
        const { email } = req.body;

        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.render('esqueceuSenha', {
                title: 'Esqueceu a senha',
                erro: 'Email não encontrado.'
            });
        }

        // Gera token único
        const token = crypto.randomBytes(32).toString('hex');
        const expira_em = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        // Salva o token no banco
        await db.RedefinicaoSenha.create({
            usuario_id: usuario.id,
            token,
            expira_em
        });

        // Envia o email com o link
        await enviarEmail(
            usuario.email,
            'Redefinição de senha - AudioSense',
            `
        <h2>Olá, ${usuario.nome_completo}!</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>AudioSense</strong>.</p>
        <p>Clique no link abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.</p>
        <a href="http://localhost:3000/usuario/redefinir-senha/${token}">Redefinir minha senha</a>
        <p>Se você não solicitou isso, ignore este email.</p>
      `
        );

        return res.render('esqueceuSenha', {
            title: 'Esqueceu a senha',
            mensagem: 'Email enviado! Verifique sua caixa de entrada.'
        });

    } catch (err) {
        console.error('Erro ao enviar email de redefinição:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// REDEFINIR SENHA — exibe o formulário com o token
export const verRedefinirSenha = async (req, res) => {
    try {
        const { token } = req.params;

        const redefinicao = await db.RedefinicaoSenha.findOne({
            where: { token, usado: 0 }
        });

        if (!redefinicao || new Date() > new Date(redefinicao.expira_em)) {
            return res.render('redefinirSenha', {
                title: 'Redefinir senha',
                erro: 'Link inválido ou expirado.',
                token: null
            });
        }

        return res.render('redefinirSenha', {
            title: 'Redefinir senha',
            token,
            erro: null
        });

    } catch (err) {
        console.error('Erro ao carregar redefinição:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// SALVAR NOVA SENHA
export const redefinirSenha = async (req, res) => {
    try {
        const { token } = req.params;
        const { senha, confirmSenha } = req.body;

        if (senha !== confirmSenha) {
            return res.render('redefinirSenha', {
                title: 'Redefinir senha',
                erro: 'As senhas não coincidem.',
                token
            });
        }

        const redefinicao = await db.RedefinicaoSenha.findOne({
            where: { token, usado: 0 }
        });

        if (!redefinicao || new Date() > new Date(redefinicao.expira_em)) {
            return res.render('redefinirSenha', {
                title: 'Redefinir senha',
                erro: 'Link inválido ou expirado.',
                token: null
            });
        }

        // Criptografa a nova senha
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Atualiza a senha do usuário
        await Usuario.update(
            { senha: senhaCriptografada },
            { where: { id: redefinicao.usuario_id } }
        );

        // Marca o token como usado
        await db.RedefinicaoSenha.update(
            { usado: 1 },
            { where: { token } }
        );

        return res.redirect('/usuario?status=senha_redefinida');

    } catch (err) {
        console.error('Erro ao redefinir senha:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

export const verMinhasAudiodescricoes = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const usuario = await db.Usuario.findOne({ where: { id: usuarioId } });
        if (!usuario) return res.redirect('/usuario');

        let audiodescricoes = [];

        if (usuario.tipo_usuario === 'discente') {
            const discente = await db.UsuarioDiscente.findOne({ where: { usuario_id: usuarioId } });
            if (discente) {
                audiodescricoes = await db.projetoAudiodescricao.findAll({
                    where: { discente_id: discente.id },
                    order: [['data_submissao', 'DESC']]
                });
            }
        } else if (usuario.tipo_usuario === 'docente') {
            const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuarioId } });
            if (docente) {
                audiodescricoes = await db.projetoAudiodescricao.findAll({
                    where: { docente_id: docente.id },
                    order: [['data_submissao', 'DESC']]
                });
            }
        }

        return res.render('minhasAudiodescricoes', {
            title: 'Minhas Audiodescrições',
            audiodescricoes: audiodescricoes.map(a => a.toJSON())
        });

    } catch (err) {
        console.error('Erro ao carregar audiodescrições:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// EXCLUIR CONTA — hard delete definitivo, com limpeza de dependências
export const excluirConta = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const usuarioId = req.usuario.id;
        const { senha } = req.body;

        if (!senha) {
            await t.rollback();
            return res.status(400).json({ sucesso: false, mensagem: 'Confirme sua senha para excluir a conta.' });
        }

        const usuario = await Usuario.findOne({ where: { id: usuarioId }, transaction: t });
        if (!usuario) {
            await t.rollback();
            return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            await t.rollback();
            return res.status(401).json({ sucesso: false, mensagem: 'Senha incorreta.' });
        }

        // Apaga dependências diretas antes do usuário, para não esbarrar em FK
        const discente = await db.UsuarioDiscente.findOne({ where: { usuario_id: usuarioId }, transaction: t });
        if (discente) {
            await db.projetoAudiodescricao.destroy({ where: { discente_id: discente.id }, transaction: t });
            await discente.destroy({ transaction: t });
        }

        const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuarioId }, transaction: t });
        if (docente) {
            await db.projetoAudiodescricao.destroy({ where: { docente_id: docente.id }, transaction: t });
            await db.MaterialDidatico.destroy({ where: { docente_id: docente.id }, transaction: t });
            await db.DocenteDisciplina.destroy({ where: { docente_id: docente.id }, transaction: t });
            await docente.destroy({ transaction: t });
        }

        // Fórum: comentários e publicações feitas pelo usuário
        const publicacoes = await db.Publicacao.findAll({ where: { usuario_id: usuarioId }, transaction: t });
        for (const pub of publicacoes) {
            await db.Comentario.destroy({ where: { publicacao_id: pub.id }, transaction: t });
        }
        await db.Comentario.destroy({ where: { usuario_id: usuarioId }, transaction: t });
        await db.Publicacao.destroy({ where: { usuario_id: usuarioId }, transaction: t });

        await db.RedefinicaoSenha.destroy({ where: { usuario_id: usuarioId }, transaction: t });

        // Por fim, apaga o usuário
        await usuario.destroy({ transaction: t });

        await t.commit();

        req.session.destroy(() => {
            res.json({ sucesso: true, mensagem: 'Conta excluída permanentemente.' });
        });
    } catch (err) {
        await t.rollback();
        console.error('Erro ao excluir conta:', err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
};

// ALTERAR NOME — respeita o limite de 30 dias já usado no resto do app
export const alterarNome = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { nome_usuario } = req.body;

        if (!nome_usuario || nome_usuario.trim() === '') {
            return res.status(400).json({ sucesso: false, mensagem: 'Informe um nome de usuário.' });
        }

        const usuario = await Usuario.findOne({ where: { id: usuarioId } });
        if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });

        if (nome_usuario === usuario.nome_usuario) {
            return res.status(400).json({ sucesso: false, mensagem: 'Esse já é o seu nome de usuário atual.' });
        }

        if (usuario.ultima_troca_nome) {
            const diasPassados = Math.floor((new Date() - new Date(usuario.ultima_troca_nome)) / (1000 * 60 * 60 * 24));
            if (diasPassados < 30) {
                return res.status(400).json({ sucesso: false, mensagem: `Você só pode trocar o nome de usuário em ${30 - diasPassados} dia(s).` });
            }
        }

        const nomeExistente = await Usuario.findOne({ where: { nome_usuario } });
        if (nomeExistente && nomeExistente.id !== usuarioId) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nome de usuário já está em uso.' });
        }

        await Usuario.update(
            { nome_usuario, ultima_troca_nome: new Date() },
            { where: { id: usuarioId } }
        );

        if (req.session.usuarioLogado) req.session.usuarioLogado.nome_usuario = nome_usuario;

        return res.json({ sucesso: true, mensagem: 'Nome de usuário atualizado com sucesso!', nome_usuario });
    } catch (err) {
        console.error('Erro ao alterar nome:', err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
};

// ALTERAR EMAIL — exige senha atual para confirmar
export const alterarEmail = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { novo_email, senha } = req.body;

        if (!novo_email || !senha) {
            return res.status(400).json({ sucesso: false, mensagem: 'Preencha o novo e-mail e sua senha atual.' });
        }

        const usuario = await Usuario.findOne({ where: { id: usuarioId } });
        if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) return res.status(401).json({ sucesso: false, mensagem: 'Senha incorreta.' });

        if (novo_email === usuario.email) {
            return res.status(400).json({ sucesso: false, mensagem: 'Esse já é o seu e-mail atual.' });
        }

        const emailExistente = await Usuario.findOne({ where: { email: novo_email } });
        if (emailExistente) return res.status(400).json({ sucesso: false, mensagem: 'Este e-mail já está em uso.' });

        await Usuario.update({ email: novo_email }, { where: { id: usuarioId } });

        return res.json({ sucesso: true, mensagem: 'E-mail atualizado com sucesso!', email: novo_email });
    } catch (err) {
        console.error('Erro ao alterar email:', err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
};

// ALTERAR SENHA — exige senha atual
export const alterarSenha = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { senha_atual, nova_senha, confirmar_senha } = req.body;

        if (!senha_atual || !nova_senha || !confirmar_senha) {
            return res.status(400).json({ sucesso: false, mensagem: 'Preencha todos os campos.' });
        }
        if (nova_senha !== confirmar_senha) {
            return res.status(400).json({ sucesso: false, mensagem: 'As senhas não coincidem.' });
        }
        if (nova_senha.length < 8) {
            return res.status(400).json({ sucesso: false, mensagem: 'A nova senha deve ter pelo menos 8 caracteres.' });
        }

        const usuario = await Usuario.findOne({ where: { id: usuarioId } });
        if (!usuario) return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });

        const senhaCorreta = await bcrypt.compare(senha_atual, usuario.senha);
        if (!senhaCorreta) return res.status(401).json({ sucesso: false, mensagem: 'Senha atual incorreta.' });

        const senhaIgualAtual = await bcrypt.compare(nova_senha, usuario.senha);
        if (senhaIgualAtual) {
            return res.status(400).json({ sucesso: false, mensagem: 'A nova senha deve ser diferente da atual.' });
        }

        const senhaCriptografada = await bcrypt.hash(nova_senha, 10);
        await Usuario.update({ senha: senhaCriptografada }, { where: { id: usuarioId } });

        return res.json({ sucesso: true, mensagem: 'Senha alterada com sucesso!' });
    } catch (err) {
        console.error('Erro ao alterar senha:', err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }
};

