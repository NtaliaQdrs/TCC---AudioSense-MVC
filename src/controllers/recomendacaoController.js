import db from '../models/index.js';
import { getUrlArquivo } from '../config/uploadService.js';

// ─── LISTAR — página pública de entretenimento ────────────────────────────────
export const listarEntretenimento = async (req, res) => {
  try {
    const recomendacoes = await db.Recomendacao.findAll({
      include: [
        { model: db.ObraAudiovisual, as: 'obra' },
        { model: db.PlataformaStreaming, as: 'plataforma' },
        {
          model: db.UsuarioDocente,
          as: 'docente',
          include: [{
            model: db.Usuario,
            as: 'usuario',
            attributes: ['nome_usuario', 'foto_perfil']
          }]
        }
      ],
      order: [['data_recomendacao', 'DESC']]
    });

    const plataformas = await db.PlataformaStreaming.findAll({
      order: [['nome', 'ASC']]
    });

    return res.render('entretenimento', {
      title: 'Entretenimento',
      usuario: req.session.usuarioLogado || null,
      recomendacoes: recomendacoes.map(r => r.toJSON()),
      plataformas: plataformas.map(p => p.toJSON())
    });
  } catch (err) {
    console.error('Erro ao listar entretenimento:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─── EXIBIR FORMULÁRIO ────────────────────────────────────────────────────────
export const exibirInserirEntretenimento = async (req, res) => {
  try {
    const usuario = req.session.usuarioLogado;

    // Só docentes e admins podem recomendar
    if (!usuario || (usuario.tipo_usuario !== 'docente' && !usuario.is_admin)) {
      return res.redirect('/entretenimento');
    }

    const plataformas = await db.PlataformaStreaming.findAll({
      order: [
        // "Outro streaming" sempre por último
        db.sequelize.literal(`CASE WHEN nome = 'Outro streaming' THEN 1 ELSE 0 END`),
        ['nome', 'ASC']
      ]
    });

    return res.render('inserirEntretenimento', {
      title: 'Recomendar Mídia',
      usuario,
      plataformas: plataformas.map(p => p.toJSON()),
      erro: req.query.erro || null
    });
  } catch (err) {
    console.error('Erro ao exibir formulário:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// ─── SALVAR RECOMENDAÇÃO ──────────────────────────────────────────────────────
export const salvarEntretenimento = async (req, res) => {
  try {
    const usuario = req.session.usuarioLogado;

    if (!usuario || (usuario.tipo_usuario !== 'docente' && !usuario.is_admin)) {
      return res.redirect('/entretenimento');
    }

    const { titulo, sinopse, tipo_obra, data_lancamento, plataforma_streaming_id } = req.body;

    // Busca o registro de docente pelo usuario.id da sessão
    const docente = await db.UsuarioDocente.findOne({
      where: { usuario_id: usuario.id }
    });

    if (!docente) {
      return res.redirect('/inserir-entretenimento?erro=sem_vinculo');
    }

    // URL do poster (se fez upload)
    const posterUrl = req.file
      ? getUrlArquivo('posters', req.file.filename)
      : null;

    // Cria a obra
    const obra = await db.ObraAudiovisual.create({
      titulo,
      sinopse: sinopse || null,
      poster_url: posterUrl,
      tipo_obra,
      data_lancamento: data_lancamento || null
    });

    // Cria a recomendação ligando docente + obra + plataforma
    await db.Recomendacao.create({
      usuario_docente_id: docente.id,
      obra_audiovisual_id: obra.id,
      plataforma_streaming_id
    });

    return res.redirect('/entretenimento');
  } catch (err) {
    console.error('Erro ao salvar recomendação:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};