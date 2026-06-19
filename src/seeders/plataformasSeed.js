import db from '../models/index.js';

const plataformas = [
  {
    nome: 'Netflix',
    logo_url: '/images/netflix.png'
  },
  {
    nome: 'Disney+',
    logo_url: '/images/disney.png'
  },
  {
    nome: 'Amazon Prime Video',
    logo_url: '/images/amazon.png'
  },
  {
    nome: 'Globoplay',
    logo_url: '/images/globoplay.png'
  },
  {
    nome: 'HBO Max',
    logo_url: '/images/hbo.png'
  },
  {
    nome: 'Apple TV+',
    logo_url: '/images/appletv.png'
  },
  {
    nome: 'Paramount+',
    logo_url: '/images/paramount.png'
  },
  {
    nome: 'Star+',
    logo_url: '/images/starplus.png'
  },
  {
    nome: 'Crunchyroll',
    logo_url: '/images/crunchyroll.png'
  },
  {
    nome: 'Outro streaming',
    logo_url: null
  }
];

const seedPlataformas = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Banco conectado!');

    for (const p of plataformas) {
      // Tenta encontrar pelo nome; se existir, atualiza a logo_url
      // Se não existir, cria com os dados completos
      const [registro, criado] = await db.PlataformaStreaming.findOrCreate({
        where: { nome: p.nome },
        defaults: { logo_url: p.logo_url }
      });

      // Se já existia (rodou o seed antes com URLs do Wikipedia), atualiza a logo
      if (!criado) {
        await registro.update({ logo_url: p.logo_url });
      }
    }

    console.log('Plataformas inseridas/atualizadas com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao inserir plataformas:', err);
    process.exit(1);
  }
};

seedPlataformas();