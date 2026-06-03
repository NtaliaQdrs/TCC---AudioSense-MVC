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

// SALVAR CORREÇÃO
export const salvarCorrecao = async (req, res) => {
  try {
    const { feedback, status } = req.body;

    const docente = await db.UsuarioDocente.findOne({
      where: { usuario_id: req.session.usuarioLogado.id }
    });

    if (!docente) return res.status(403).json({ erro: 'Docente não encontrado.' });

    // Busca o projeto para pegar o discente_id
    const projeto = await db.projetoAudiodescricao.findByPk(req.params.id, {
      include: [{ model: db.UsuarioDiscente }]
    });

    if (!projeto) return res.status(404).json({ erro: 'Projeto não encontrado.' });

    // Atualiza status do projeto
    await db.projetoAudiodescricao.update(
        { 
          status, 
          docente_id: docente.id,
          data_aprovacao: status === 'aprovado' ? new Date() : null
        },
        { where: { id: req.params.id } }
      );

    // Salva a correção
    await db.correcaoAudiodescricao.create({
      projeto_id: req.params.id,
      texto_sugestao: feedback,
      docente_id: docente.id,
      data_correcao: new Date()
    });

    // Monta notificação de acordo com o status
    const usuario_id = projeto.UsuarioDiscente.usuario_id;

    let titulo, mensagem, link;

    if (status === 'aprovado') {
      titulo = '✅ Audiodescrição aprovada!';
      mensagem = `Sua audiodescrição "${projeto.titulo}" foi aprovada. Agora você pode enviar o áudio final.`;
      link = `/enviar-audio/${projeto.id}`;
    } else if (status === 'requer_ajustes') {
      titulo = '✏️ Ajustes necessários';
      mensagem = `Sua audiodescrição "${projeto.titulo}" requer ajustes. Veja o feedback do docente e reenvie.`;
      link = `/ajustar-audiodescricao/${projeto.id}`;
    }

    await db.Notificacao.create({
      usuario_id,
      titulo,
      mensagem,
      link,
      data_criacao: new Date()
    });

    return res.redirect('/audiodescricao');

  } catch (err) {
    console.error('Erro ao salvar correção:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// EXIBIR TELA DE AJUSTE (discente corrige e reenviar)
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

// EXIBIR TELA DE ENVIO DE ÁUDIO
export const exibirEnviarAudio = async (req, res) => {
  try {
    const projeto = await db.projetoAudiodescricao.findByPk(req.params.id);
    if (!projeto) return res.status(404).send('Projeto não encontrado.');

    return res.render('enviarAudio', {
      title: 'Enviar Áudio',
      usuarioLogado: req.session.usuarioLogado,
      projeto
    });
  } catch (err) {
    console.error('Erro ao exibir envio de áudio:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// SALVAR ÁUDIO FINAL
export const salvarAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });

    await db.projetoAudiodescricao.update(
      { audio_final_url: req.file.filename, status: 'concluido' },
      { where: { id: req.params.id } }
    );

    return res.redirect('/audiodescricao?sucesso=1');
  } catch (err) {
    console.error('Erro ao salvar áudio:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

export const verAudiodescricao = async (req, res) => {
  console.log('verAudiodescricao chamado, id:', req.params.id);
  try {
    const projeto = await db.projetoAudiodescricao.findByPk(req.params.id);
    console.log('projeto encontrado:', projeto ? projeto.titulo : 'não encontrado');
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