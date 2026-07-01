import db from '../models/index.js';

// INSERIR AUDIODESCRIÇÃO
export const inserirAudiodescricao = async (req, res) => {
  try {
    const { titulo, descricao, roteiro, tipo_midia } = req.body;
    const usuarioId = req.session.usuarioLogado.id;

    const discente = await db.UsuarioDiscente.findOne({ where: { usuario_id: usuarioId } });
    if (!discente) {
      return res.status(403).json({ erro: 'Apenas discentes podem inserir audiodescrições.' });
    }

    await db.projetoAudiodescricao.create({
      titulo,
      descricao,
      tipo_midia,
      imagem_url: tipo_midia === 'imagem' && req.file ? `${process.env.R2_PUBLIC_URL}/${req.file.key}` : null,
      roteiro_texto: roteiro,
      audio_final_url: null,
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
            include: [{ model: db.Usuario, attributes: ['nome_completo'] }]
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
          where: { discente_id: discente.id, status: 'em_analise' }
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

// EXIBIR TELA DE CORREÇÃO
export const exibirCorrecao = async (req, res) => {
  try {
    const projeto = await db.projetoAudiodescricao.findByPk(req.params.id, {
      include: [
        {
          model: db.UsuarioDiscente,
          include: [{ model: db.Usuario, attributes: ['nome_completo'] }]
        }
      ]
    });

    if (!projeto) return res.status(404).send('Projeto não encontrado.');

    return res.render('correcaoAudiodescricao', {
      title: 'Correção de Audiodescrição',
      usuarioLogado: req.session.usuarioLogado,
      projeto
    });
  } catch (err) {
    console.error('Erro ao exibir correção:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// SALVAR CORREÇÃO (docente)
export const salvarCorrecao = async (req, res) => {
  try {
    const { feedback, status } = req.body;

    const docente = await db.UsuarioDocente.findOne({
      where: { usuario_id: req.session.usuarioLogado.id }
    });
    if (!docente) return res.status(403).json({ erro: 'Docente não encontrado.' });

    const projeto = await db.projetoAudiodescricao.findByPk(req.params.id, {
      include: [{ model: db.UsuarioDiscente }]
    });
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado.' });

    await db.projetoAudiodescricao.update(
      {
        status,
        docente_id: docente.id,
        data_aprovacao: status === 'aprovado' ? new Date() : null
      },
      { where: { id: req.params.id } }
    );

    await db.correcaoAudiodescricao.create({
      projeto_id: req.params.id,
      texto_sugestao: feedback,
      docente_id: docente.id,
      data_correcao: new Date()
    });

    const usuario_id = projeto.UsuarioDiscente.usuario_id;
    const midiaLabel = projeto.tipo_midia === 'video' ? 'vídeo' : 'áudio';

    let titulo, mensagem, link;

    if (status === 'aprovado') {
      titulo = '✅ Roteiro aprovado!';
      mensagem = `Seu roteiro "${projeto.titulo}" foi aprovado. Agora você pode enviar o ${midiaLabel} final.`;
      link = `/enviar-midia-final/${projeto.id}`;
    } else if (status === 'requer_ajustes') {
      titulo = '✏️ Ajustes necessários';
      mensagem = `Seu roteiro "${projeto.titulo}" requer ajustes. Veja o feedback do docente e reenvie.`;
      link = `/ajustar-audiodescricao/${projeto.id}`;
    }

    await db.Notificacao.create({ usuario_id, titulo, mensagem, link, data_criacao: new Date() });

    return res.redirect('/audiodescricao');
  } catch (err) {
    console.error('Erro ao salvar correção:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// EXIBIR TELA DE AJUSTE (discente reenviar)
export const exibirAjuste = async (req, res) => {
  try {
    const projeto = await db.projetoAudiodescricao.findByPk(req.params.id, {
      include: [{
        model: db.correcaoAudiodescricao,
        order: [['data_correcao', 'DESC']],
        limit: 1
      }]
    });

    if (!projeto) return res.status(404).send('Projeto não encontrado.');

    return res.render('ajustarAudiodescricao', {
      title: 'Ajustar Audiodescrição',
      usuarioLogado: req.session.usuarioLogado,
      projeto: projeto.toJSON()
    });
  } catch (err) {
    console.error('Erro ao exibir ajuste:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// SALVAR AJUSTE (reenviar para análise)
export const salvarAjuste = async (req, res) => {
  try {
    const { roteiro } = req.body;

    await db.projetoAudiodescricao.update(
      { roteiro_texto: roteiro, status: 'em_analise' },
      { where: { id: req.params.id } }
    );

    return res.redirect('/audiodescricao?sucesso=1');
  } catch (err) {
    console.error('Erro ao salvar ajuste:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// EXIBIR TELA DE ENVIO DE MÍDIA FINAL
export const exibirEnviarMidiaFinal = async (req, res) => {
  try {
    const projeto = await db.projetoAudiodescricao.findByPk(req.params.id);
    if (!projeto) return res.status(404).send('Projeto não encontrado.');

    return res.render('enviarMidiaFinal', {
      title: projeto.tipo_midia === 'video' ? 'Enviar Vídeo' : 'Enviar Áudio',
      usuarioLogado: req.session.usuarioLogado,
      projeto: projeto.toJSON()
    });
  } catch (err) {
    console.error('Erro ao exibir envio de mídia final:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// SALVAR MÍDIA FINAL (áudio ou vídeo)
export const salvarMidiaFinal = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });

    await db.projetoAudiodescricao.update(
      { audio_final_url: `${process.env.R2_PUBLIC_URL}/${req.file.key}`, status: 'concluido' },
      { where: { id: req.params.id } }
    );

    return res.redirect('/audiodescricao?sucesso=1');
  } catch (err) {
    console.error('Erro ao salvar mídia final:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// VER AUDIODESCRIÇÃO
export const verAudiodescricao = async (req, res) => {
  try {
    const projeto = await db.projetoAudiodescricao.findByPk(req.params.id);
    if (!projeto) return res.status(404).send('Projeto não encontrado.');

    return res.render('verAudiodescricao', {
      title: projeto.titulo,
      usuarioLogado: req.session.usuarioLogado,
      projeto: projeto.toJSON()
    });
  } catch (err) {
    console.error('Erro ao ver audiodescrição:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// APAGAR AUDIODESCRIÇÃO
export const apagarAudiodescricao = async (req, res) => {
  try {
    const usuarioId = req.session.usuarioLogado.id;
    const projetoId = req.params.id;

    const discente = await db.UsuarioDiscente.findOne({ where: { usuario_id: usuarioId } });
    if (!discente) return res.status(403).json({ erro: 'Acesso negado.' });

    const projeto = await db.projetoAudiodescricao.findOne({
      where: { id: projetoId, discente_id: discente.id }
    });
    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado.' });

    if (projeto.status === 'em_analise') {
      return res.status(400).json({ erro: 'Não é possível apagar uma audiodescrição que está em análise.' });
    }

    await projeto.destroy();
    return res.redirect('/usuario/minhas-audiodescricoes');
  } catch (err) {
    console.error('Erro ao apagar audiodescrição:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};