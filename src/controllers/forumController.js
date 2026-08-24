import db from '../models/index.js';

const Publicacao = db.Publicacao;
const Comentario = db.Comentario;

// Listar todos os tópicos do fórum
export const listarTopicos = async (req, res) => {
    try {
        const topicos = await Publicacao.findAll({
            include: [
                { model: db.Usuario, as: 'autor', attributes: ['id', 'nome_usuario', 'foto_perfil'] },
                { model: Comentario, as: 'comentarios', attributes: ['id'] }
            ],
            order: [['data_postagem', 'DESC']]
        });

        const usuarioLogadoId = req.session.usuarioLogado ? req.session.usuarioLogado.id : null;

        let idsCurtidos = [];
        if (usuarioLogadoId) {
            const curtidas = await db.PublicacaoCurtida.findAll({
                where: { usuario_id: usuarioLogadoId },
                attributes: ['publicacao_id']
            });
            idsCurtidos = curtidas.map(c => c.publicacao_id);
        }

        res.render('forum', { topicos, usuarioLogadoId, idsCurtidos });
    } catch (err) {
        console.error('Erro ao listar tópicos:', err);
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// Exibe o formulário de criação de tópico
export const mostrarFormulario = async (req, res) => {
    try {
        const usuario = await db.Usuario.findOne({
            where: { id: req.usuario.id },
            attributes: ['id', 'nome_usuario', 'foto_perfil']
        });
        return res.render('inserirTopico', { usuario });
    } catch (err) {
        console.error('Erro ao carregar formulário:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// Criar novo tópico
export const criarTopico = async (req, res) => {
    try {
        const { titulo, corpo } = req.body;
        const usuario_id = req.usuario.id;

        if (!titulo || !corpo) {
            return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios.' });
        }

        const novaPublicacao = await Publicacao.create({
            titulo,
            corpo_texto: corpo,
            usuario_id
        });

        return res.redirect(`/forum/${novaPublicacao.id}`);
    } catch (err) {
        console.error('Erro ao criar tópico:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// Ver um tópico específico com seus comentários
export const verTopico = async (req, res) => {
    try {
        const { id } = req.params;

        const topico = await Publicacao.findOne({
            where: { id },
            include: [{ model: db.Usuario, as: 'autor', attributes: ['id', 'nome_usuario', 'foto_perfil'] }]
        });

        if (!topico) return res.status(404).send('Tópico não encontrado');

        const comentarios = await Comentario.findAll({
            where: { publicacao_id: id, resposta_a_comentario_id: null },
            include: [
                { model: db.Usuario, as: 'autor', attributes: ['id', 'nome_usuario', 'foto_perfil'] },
                {
                    model: Comentario,
                    as: 'respostas',
                    include: [{ model: db.Usuario, as: 'autor', attributes: ['id', 'nome_usuario', 'foto_perfil'] }]
                }
            ],
            order: [['data_comentario', 'ASC']]
        });

        const usuarioLogadoId = req.session.usuarioLogado ? req.session.usuarioLogado.id : null;

        let jaCurtiu = false;
        if (usuarioLogadoId) {
            const curtida = await db.PublicacaoCurtida.findOne({
                where: { usuario_id: usuarioLogadoId, publicacao_id: id }
            });
            jaCurtiu = !!curtida;
        }

        return res.render('topico', { topico, comentarios, usuarioLogadoId, jaCurtiu });
    } catch (err) {
        console.error('Erro ao carregar tópico:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// Adicionar comentário ou resposta
export const adicionarComentario = async (req, res) => {
    try {
        const { id } = req.params; // id da publicacao
        const { texto_comentario, resposta_a_comentario_id } = req.body;
        const usuario_id = req.usuario.id;

        if (!texto_comentario) {
            return res.status(400).json({ erro: 'O comentário não pode estar vazio.' });
        }

        await Comentario.create({
            publicacao_id: id,
            usuario_id,
            texto_comentario,
            resposta_a_comentario_id: resposta_a_comentario_id || null
        });

        return res.redirect(`/forum/${id}`);
    } catch (err) {
        console.error('Erro ao adicionar comentário:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// Curtir tópico (contador simples)
// Curtir tópico (toggle, com proteção contra race condition)
export const curtirTopico = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        // lock na linha da publicação durante a transação, evita duas
        // requisições concorrentes lendo o mesmo estado ao mesmo tempo
        const topico = await Publicacao.findOne({
            where: { id },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!topico) {
            await t.rollback();
            return res.status(404).json({ erro: 'Tópico não encontrado' });
        }

        const jaCurtiu = await db.PublicacaoCurtida.findOne({
            where: { usuario_id, publicacao_id: id },
            transaction: t
        });

        if (jaCurtiu) {
            await jaCurtiu.destroy({ transaction: t });
            topico.curtidas = Math.max(0, topico.curtidas - 1);
            await topico.save({ transaction: t });
            await t.commit();
            return res.json({ curtidas: topico.curtidas, curtido: false });
        }

        await db.PublicacaoCurtida.create({ usuario_id, publicacao_id: id }, { transaction: t });
        topico.curtidas += 1;
        await topico.save({ transaction: t });
        await t.commit();

        return res.json({ curtidas: topico.curtidas, curtido: true });
    } catch (err) {
        await t.rollback();
        console.error('Erro ao curtir tópico:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

// Apagar tópico (só o autor pode)
export const apagarTopico = async (req, res) => {
    try {
        const { id } = req.params;
        const topico = await Publicacao.findOne({ where: { id } });

        if (!topico) return res.status(404).json({ erro: 'Tópico não encontrado.' });

        if (topico.usuario_id !== req.usuario.id) {
            return res.status(403).json({ erro: 'Você não tem permissão para apagar este tópico.' });
        }

        await Comentario.destroy({ where: { publicacao_id: id } });
        // Apaga as curtidas relacionadas antes do tópico, pra não violar a FK
        await db.PublicacaoCurtida.destroy({ where: { publicacao_id: topico.id } });

        // (se também tiver comentários vinculados, mesma lógica se aplica a eles)
        await db.Comentario.destroy({ where: { publicacao_id: topico.id } });

        await topico.destroy();

        return res.redirect('/forum');
    } catch (err) {
        console.error('Erro ao apagar tópico:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};
