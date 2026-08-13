import db from '../models/index.js';

// EXIBIR FORMULÁRIO DE INSERÇÃO
export const exibirInserirMaterial = async (req, res) => {
  try {
    const disciplinas = await db.Disciplina.findAll({ order: [['titulo', 'ASC']] });

    return res.render('inserirMaterial', {
      title: 'Inserir Material',
      usuario: req.session.usuarioLogado || null,
      disciplinas
    });
  } catch (err) {
    console.error('Erro ao exibir formulário de material:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// INSERIR MATERIAL (docente)
export const inserirMaterial = async (req, res) => {
  try {
    const { titulo, tipo_material, descricao, disciplina_id, disciplina_outro } = req.body;
    const usuarioId = req.session.usuarioLogado.id;

    const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuarioId } });
    if (!docente) {
      return res.status(403).json({ erro: 'Apenas docentes podem inserir material didático.' });
    }

    const arquivoFile = req.files?.arquivo?.[0];
    const audioFile = req.files?.audio_descricao?.[0];
    const capaFile = req.files?.capa?.[0];

    if (!arquivoFile) {
      return res.status(400).json({ erro: 'O arquivo do material é obrigatório.' });
    }

    if (tipo_material !== 'video' && !audioFile) {
      return res.status(400).json({ erro: 'O áudio de audiodescrição é obrigatório para este tipo de material.' });
    }

    // Disciplina: se veio um ID válido da lista, usa ele; senão (vazio ou "outro"), usa o texto digitado
    const disciplinaIdFinal = (disciplina_id && disciplina_id !== 'outro') ? Number(disciplina_id) : null;
    const disciplinaOutroFinal = disciplinaIdFinal ? null : (disciplina_outro || null);

    await db.MaterialDidatico.create({
      titulo,
      tipo_material,
      descricao,
      disciplina_id: disciplinaIdFinal,
      disciplina_outro: disciplinaOutroFinal,
      caminho_arquivo: `${process.env.R2_PUBLIC_URL}/${arquivoFile.key}`,
      caminho_audio_descricao: tipo_material === 'video' ? null : `${process.env.R2_PUBLIC_URL}/${audioFile.key}`,
      caminho_capa: capaFile ? `${process.env.R2_PUBLIC_URL}/${capaFile.key}` : null,
      docente_id: docente.id
    });

    return res.redirect('/biblioteca?sucesso=1');
  } catch (err) {
    console.error('Erro ao inserir material didático:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};


// LISTAR BIBLIOTECA
export const listarMateriais = async (req, res) => {
  try {
    const usuario = req.session.usuarioLogado || null;

    const materiais = await db.MaterialDidatico.findAll({
      include: [
        {
          model: db.UsuarioDocente,
          as: 'docente',
          include: [{ model: db.Usuario, as: 'usuario', attributes: ['nome_completo'] }]
        },
        { model: db.Disciplina, as: 'disciplina' },
        { model: db.AvaliacaoMaterial, as: 'avaliacoes' }
      ],
      order: [['data_publicacao', 'DESC']]
    });

    const materiaisFormatados = materiais.map((m) => {
      const avaliacoes = m.avaliacoes || [];
      const media = avaliacoes.length
        ? avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length
        : null;

      return {
        id: m.id,
        titulo: m.titulo,
        descricao: m.descricao,
        tipo_material: m.tipo_material,
        capa: m.caminho_capa,
        docenteNome: m.docente?.usuario?.nome_completo || 'Docente',
        disciplinaNome: m.disciplina ? m.disciplina.titulo : (m.disciplina_outro || null),
        data_publicacao: m.data_publicacao,
        media: media ? media.toFixed(1) : null,
        totalAvaliacoes: avaliacoes.length,
        podeApagar: !!(usuario && usuario.tipo_usuario === 'docente' && m.docente?.usuario_id === usuario.id)
      };
    });

    return res.render('biblioteca', {
      title: 'Biblioteca',
      usuario,
      materiais: materiaisFormatados
    });
  } catch (err) {
    console.error('Erro ao listar biblioteca:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// APAGAR MATERIAL (só o docente que inseriu)
// APAGAR MATERIAL (só o docente que inseriu)
export const apagarMaterial = async (req, res) => {
  try {
    const usuarioId = req.session.usuarioLogado.id;
    const materialId = req.params.id;

    const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuarioId } });
    if (!docente) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }

    const material = await db.MaterialDidatico.findOne({
      where: { id: materialId, docente_id: docente.id }
    });

    if (!material) {
      return res.status(404).json({ erro: 'Material não encontrado ou você não tem permissão para apagá-lo.' });
    }

    // Apaga as avaliações relacionadas antes do material, pra não violar a FK
    await db.AvaliacaoMaterial.destroy({ where: { material_didatico_id: material.id } });

    await material.destroy();
    return res.redirect('/biblioteca');
  } catch (err) {
    console.error('Erro ao apagar material:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// VER MATERIAL (detalhe)
export const verMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await db.MaterialDidatico.findByPk(materialId, {
      include: [
        {
          model: db.UsuarioDocente,
          as: 'docente',
          include: [{ model: db.Usuario, as: 'usuario', attributes: ['nome_completo', 'foto_perfil'] }]
        },
        { model: db.Disciplina, as: 'disciplina' },
        {
          model: db.AvaliacaoMaterial,
          as: 'avaliacoes',
          include: [{
            model: db.UsuarioDiscente,
            as: 'discente',
            include: [{ model: db.Usuario, attributes: ['nome_completo', 'foto_perfil'] }]
          }],
          order: [['data_avaliacao', 'DESC']]
        }
      ]
    });

    if (!material) return res.status(404).send('Material não encontrado.');

    const avaliacoes = material.avaliacoes || [];
    const media = avaliacoes.length
      ? (avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length)
      : null;

    const usuarioLogado = req.session.usuarioLogado || null;
    let jaAvaliou = false;

    if (usuarioLogado && usuarioLogado.tipo_usuario === 'discente') {
      const discente = await db.UsuarioDiscente.findOne({ where: { usuario_id: usuarioLogado.id } });
      if (discente) {
        jaAvaliou = avaliacoes.some((a) => a.discente_id === discente.id);
      }
    }

    return res.render('verMaterial', {
      title: material.titulo,
      usuario: usuarioLogado,
      material: material.toJSON(),
      media: media ? media.toFixed(1) : null,
      totalAvaliacoes: avaliacoes.length,
      podeAvaliar: usuarioLogado?.tipo_usuario === 'discente' && !jaAvaliou
    });
  } catch (err) {
    console.error('Erro ao ver material:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// LISTAR MEUS MATERIAIS (docente)
export const meusMateriais = async (req, res) => {
  try {
    const usuarioId = req.session.usuarioLogado.id;
    const docente = await db.UsuarioDocente.findOne({ where: { usuario_id: usuarioId } });
    if (!docente) return res.status(403).send('Acesso negado.');

    const materiais = await db.MaterialDidatico.findAll({
      where: { docente_id: docente.id },
      include: [
        { model: db.Disciplina, as: 'disciplina' },
        { model: db.AvaliacaoMaterial, as: 'avaliacoes' }
      ],
      order: [['data_publicacao', 'DESC']]
    });

    const materiaisFormatados = materiais.map((m) => {
      const avaliacoes = m.avaliacoes || [];
      const media = avaliacoes.length
        ? avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length
        : null;
      return {
        id: m.id,
        titulo: m.titulo,
        descricao: m.descricao,
        tipo_material: m.tipo_material,
        capa: m.caminho_capa,
        disciplinaNome: m.disciplina ? m.disciplina.titulo : (m.disciplina_outro || null),
        data_publicacao: m.data_publicacao,
        media: media ? media.toFixed(1) : null,
        totalAvaliacoes: avaliacoes.length
      };
    });

    return res.render('meusMateriais', {
      title: 'Meus Materiais',
      usuario: req.session.usuarioLogado,
      materiais: materiaisFormatados
    });
  } catch (err) {
    console.error('Erro ao listar meus materiais:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// AVALIAR MATERIAL (discente)
export const avaliarMaterial = async (req, res) => {
  try {
    const { nota, comentario } = req.body;
    const usuarioId = req.session.usuarioLogado.id;
    const materialId = req.params.id;

    const discente = await db.UsuarioDiscente.findOne({ where: { usuario_id: usuarioId } });
    if (!discente) {
      return res.status(403).json({ erro: 'Apenas discentes podem avaliar materiais.' });
    }

    const material = await db.MaterialDidatico.findByPk(materialId);
    if (!material) {
      return res.status(404).json({ erro: 'Material não encontrado.' });
    }

    const jaAvaliou = await db.AvaliacaoMaterial.findOne({
      where: { material_didatico_id: materialId, discente_id: discente.id }
    });
    if (jaAvaliou) {
      return res.status(400).json({ erro: 'Você já avaliou este material.' });
    }

    const notaNum = Number(nota);
    if (!notaNum || notaNum < 1 || notaNum > 5) {
      return res.status(400).json({ erro: 'A nota deve ser de 1 a 5.' });
    }

    await db.AvaliacaoMaterial.create({
      material_didatico_id: materialId,
      discente_id: discente.id,
      nota: notaNum,
      comentario: comentario || null
    });

    return res.redirect(`/material/${materialId}`);
  } catch (err) {
    console.error('Erro ao avaliar material:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};