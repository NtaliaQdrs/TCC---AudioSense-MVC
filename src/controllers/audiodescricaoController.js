import db from '../models/index.js';

// INSERIR AUDIODESCRIÇÃO
export const inserirAudiodescricao = async (req, res) => {
  console.log('Models disponíveis:', Object.keys(db));
  try {
    console.log('FILE:', req.file);
    console.log('BODY:', req.body);
    const { titulo, descricao, roteiro } = req.body;
    const usuarioId = req.session.usuarioLogado.id;

    // Busca o discente_id
    const discente = await db.UsuarioDiscente.findOne({ where: { usuario_id: usuarioId } });
    if (!discente) {
      return res.status(403).json({ erro: 'Apenas discentes podem inserir audiodescrições.' });
    }

    await db.projetoAudiodescricao.create({
      titulo,
      descricao,
      roteiro_texto: roteiro,
      imagem_url: req.file ? req.file.filename : null,
      status: 'em_analise',
      discente_id: discente.id
    });

    return res.redirect('/audiodescricao?sucesso=1');

  } catch (err) {
    console.error('Erro ao inserir audiodescrição:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// LISTAR AUDIODESCRIÇÕES
export const listarAudiodescricoes = async (req, res) => {
  try {
    let projetosParaCorrigir = [];
    let projetoEmAnalise = null;

    if (req.session.usuarioLogado?.tipo_usuario === 'docente') {
      projetosParaCorrigir = await db.projetoAudiodescricao.findAll({
        where: { status: 'em_analise' },
        order: [['data_submissao', 'DESC']],
        include: [
          {
            model: db.UsuarioDiscente,
            attributes: ['id'],
            include: [
              {
                model: db.Usuario,
                attributes: ['nome_completo']
              }
            ]
          }
        ]
      });
    }

    if (req.session.usuarioLogado?.tipo_usuario === 'discente') {
      const discente = await db.UsuarioDiscente.findOne({
        where: { usuario_id: req.session.usuarioLogado.id }
      });

      if (discente) {
        projetoEmAnalise = await db.projetoAudiodescricao.findOne({
          where: {
            discente_id: discente.id,
            status: 'em_analise'
          }
        });
      }
    }

    return res.render('audiodescricao', {
      title: 'Audiodescrição',
      usuarioLogado: req.session.usuarioLogado || null,
      projetosParaCorrigir,
      projetoEmAnalise
    });

  } catch (err) {
    console.error('Erro ao listar audiodescrições:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};