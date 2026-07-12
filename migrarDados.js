// migrarDados.js
// Script para copiar os dados do MySQL local para o Supabase (Postgres)
// Rode com: node migrarDados.js

import mysql from 'mysql2/promise';
import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

// ===== CONFIGURAÇÃO DE ORIGEM (seu MySQL local) =====
const origemConfig = {
  host: process.env.OLD_DB_HOST || 'localhost',
  port: process.env.OLD_DB_PORT || 3306,
  user: process.env.OLD_DB_USER,
  password: process.env.OLD_DB_PASSWORD,
  database: process.env.OLD_DB_DATABASE
};

// ===== CONFIGURAÇÃO DE DESTINO (Supabase) =====
const destinoConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false }
};

// ===== ORDEM DAS TABELAS =====
// IMPORTANTE: tabelas "pai" (sem dependência) vêm primeiro,
// tabelas "filha" (com foreign key) vêm depois.
// Ajuste essa lista se seu projeto tiver tabelas diferentes ou em outra ordem.
const TABELAS_EM_ORDEM = [
  'usuario',
  'usuario_discente',
  'usuario_docente',
  'disciplina',
  'docente_disciplina',
  'obra_audiovisual',
  'plataforma_streaming',
  'projeto_audiodescricao',
  'correcao_audiodescricao',
  'notificacao',
  'recomendacao',
  'redefinicao_senha',
  'solicitacao_admin'
];

async function migrar() {
  const origem = await mysql.createConnection(origemConfig);
  const destino = new Client(destinoConfig);
  await destino.connect();

  console.log('Conectado nos dois bancos. Iniciando migração...\n');

  for (const tabela of TABELAS_EM_ORDEM) {
    try {
      const [linhas] = await origem.query(`SELECT * FROM \`${tabela}\``);

      if (linhas.length === 0) {
        console.log(`(vazio) ${tabela} — nada para copiar`);
        continue;
      }

      const colunas = Object.keys(linhas[0]);
      const colunasSql = colunas.map(c => `"${c}"`).join(', ');

      let inseridos = 0;
      for (const linha of linhas) {
        const valores = colunas.map(c => linha[c]);
        const placeholders = colunas.map((_, i) => `$${i + 1}`).join(', ');

        const query = `INSERT INTO "${tabela}" (${colunasSql}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

        await destino.query(query, valores);
        inseridos++;
      }

      console.log(`OK: ${tabela} — ${inseridos} registro(s) copiado(s)`);
    } catch (err) {
      console.error(`ERRO na tabela ${tabela}:`, err.message);
    }
  }

  await origem.end();
  await destino.end();

  console.log('\nMigração finalizada.');
}

migrar().catch(err => {
  console.error('Erro fatal na migração:', err);
  process.exit(1);
});