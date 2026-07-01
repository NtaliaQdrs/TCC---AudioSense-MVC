import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '../src/config/storage.js';
import db from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

// Mapeamento: pasta local -> { model, campo }
const MAPEAMENTO = {
  'fotos-perfil': { model: db.Usuario, campo: 'foto_perfil' },
  'comprovantes': { model: db.UsuarioDocente, campo: 'comprovante_vinculo' },
  'audios':       { model: db.projetoAudiodescricao, campo: 'audio_final_url' },
  'midias':       { model: db.projetoAudiodescricao, campo: 'imagem_url' },
  'posters':      { model: db.ObraAudiovisual, campo: 'poster_url' },
};

async function subirArquivo(subpasta, filename) {
  const filePath = path.join(UPLOAD_DIR, subpasta, filename);
  const buffer = fs.readFileSync(filePath);
  const key = `${subpasta}/${filename}`;

  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
  }));

  return `${R2_PUBLIC_URL}/${key}`;
}

async function migrarPasta(subpasta) {
  const config = MAPEAMENTO[subpasta];
  const pastaPath = path.join(UPLOAD_DIR, subpasta);

  if (!fs.existsSync(pastaPath)) {
    console.log(`⚠️  Pasta ${subpasta} não existe, pulando.`);
    return;
  }

  const arquivos = fs.readdirSync(pastaPath);
  console.log(`\n📁 ${subpasta}: ${arquivos.length} arquivo(s)`);

  for (const filename of arquivos) {
    try {
      // Sobe pro R2 sempre, independente de achar no banco
      const url = await subirArquivo(subpasta, filename);

      // Tenta encontrar e atualizar o registro correspondente no banco
      const registro = await config.model.findOne({
        where: { [config.campo]: filename }
      });

      if (registro) {
        registro[config.campo] = url;
        await registro.save();
        console.log(`  ✅ ${filename} -> subiu e atualizou no banco`);
      } else {
        console.log(`  ⬆️  ${filename} -> subiu pro R2, mas NÃO achou registro no banco (arquivo órfão ou de vídeo sem campo próprio)`);
      }
    } catch (err) {
      console.error(`  ❌ Erro em ${filename}:`, err.message);
    }
  }
}

async function main() {
  console.log('Iniciando migração de uploads para o R2...');

  for (const subpasta of Object.keys(MAPEAMENTO)) {
    await migrarPasta(subpasta);
  }

  console.log('\n✅ Migração concluída.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Erro fatal na migração:', err);
  process.exit(1);
});