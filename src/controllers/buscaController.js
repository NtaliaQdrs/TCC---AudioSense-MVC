import { Op } from 'sequelize';
import db from '../models/index.js';

const CARACTERES_ACENTUADOS = 'áàâãäåéèêëíìîïóòôõöúùûüçñýÿ';
const CARACTERES_NORMALIZADOS = 'aaaaaaeeeeiiiiooooouuuucnyy';

function removerAcentos(termo) {
    return termo
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLocaleLowerCase('pt-BR');
}

function criarVariantesDeBusca(termo) {
    const caracteres = Array.from(termo);
    const frequencias = new Map();
    caracteres.forEach(caractere => {
        frequencias.set(caractere, (frequencias.get(caractere) || 0) + 1);
    });

    const variantes = new Set([termo]);
    caracteres.forEach((caractere, indice) => {
        if (frequencias.get(caractere) > 1 && /[a-z0-9]/.test(caractere)) {
            variantes.add([
                ...caracteres.slice(0, indice + 1),
                caractere,
                ...caracteres.slice(indice + 1)
            ].join(''));
        }
    });

    return [...variantes];
}

function buscarCampoSemAcentos(campo, padrao) {
    const textoNormalizado = db.sequelize.fn(
        'translate',
        db.sequelize.fn('lower', db.sequelize.col(campo)),
        CARACTERES_ACENTUADOS,
        CARACTERES_NORMALIZADOS
    );

    return db.sequelize.where(textoNormalizado, { [Op.like]: padrao });
}

export const buscarConteudo = async (req, res) => {
    const consulta = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (consulta.length > 100) {
        return res.status(400).render('buscar', {
            title: 'Buscar conteúdo',
            consulta: consulta.slice(0, 100),
            resultados: [],
            erro: 'A busca deve ter no máximo 100 caracteres.'
        });
    }

    try {
        let resultados = [];
        if (consulta) {
            const padrao = `%${consulta.replace(/[\\%_]/g, '\\$&')}%`;
            const padroesDeMateriais = criarVariantesDeBusca(removerAcentos(consulta))
                .map(termo => `%${termo.replace(/[\\%_]/g, '\\$&')}%`);
            const [topicos, materiais, obras] = await Promise.all([
                db.Publicacao.findAll({
                    where: {
                        [Op.or]: [
                            { titulo: { [Op.iLike]: padrao } },
                            { corpo_texto: { [Op.iLike]: padrao } }
                        ]
                    },
                    attributes: ['id', 'titulo', 'corpo_texto'],
                    order: [['data_postagem', 'DESC']],
                    limit: 10
                }),
                db.MaterialDidatico.findAll({
                    where: {
                        [Op.or]: padroesDeMateriais.flatMap(padraoMaterial => [
                            buscarCampoSemAcentos('titulo', padraoMaterial),
                            buscarCampoSemAcentos('descricao', padraoMaterial)
                        ])
                    },
                    attributes: ['id', 'titulo', 'descricao'],
                    order: [['data_publicacao', 'DESC']],
                    limit: 10
                }),
                db.ObraAudiovisual.findAll({
                    where: {
                        [Op.or]: [
                            { titulo: { [Op.iLike]: padrao } },
                            { sinopse: { [Op.iLike]: padrao } }
                        ]
                    },
                    attributes: ['id', 'titulo', 'sinopse'],
                    order: [['titulo', 'ASC']],
                    limit: 10
                })
            ]);

            resultados = [
                ...topicos.map(item => ({
                    tipo: 'Fórum',
                    titulo: item.titulo,
                    resumo: item.corpo_texto,
                    href: `/forum/${item.id}`
                })),
                ...materiais.map(item => ({
                    tipo: 'Material',
                    titulo: item.titulo,
                    resumo: item.descricao,
                    href: `/material/${item.id}`
                })),
                ...obras.map(item => ({
                    tipo: 'Obra audiovisual',
                    titulo: item.titulo,
                    resumo: item.sinopse,
                    href: `/entretenimento#obra-${item.id}`
                }))
            ];
        }

        return res.render('buscar', {
            title: 'Buscar conteúdo',
            consulta,
            resultados,
            erro: null
        });
    } catch (err) {
        console.error('Erro ao buscar conteúdo:', err);
        return res.status(500).render('buscar', {
            title: 'Buscar conteúdo',
            consulta,
            resultados: [],
            erro: 'Não foi possível realizar a busca agora.'
        });
    }
};
