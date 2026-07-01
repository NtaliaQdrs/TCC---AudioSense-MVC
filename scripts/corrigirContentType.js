import 'dotenv/config';
import { S3Client, ListObjectsV2Command, CopyObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET } from '../src/config/storage.js';

const MIME_TYPES = {
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
};

function getMimeType(key) {
  const ext = key.slice(key.lastIndexOf('.')).toLowerCase();
  return MIME_TYPES[ext] || null;
}

async function listarTodosObjetos() {
  let objetos = [];
  let continuationToken = undefined;

  do {
    const resposta = await r2Client.send(new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      ContinuationToken: continuationToken,
    }));

    objetos = objetos.concat(resposta.Contents || []);
    continuationToken = resposta.NextContinuationToken;
  } while (continuationToken);

  return objetos;
}

async function main() {
  console.log('Listando objetos no bucket...');
  const objetos = await listarTodosObjetos();
  console.log(`Encontrados ${objetos.length} objeto(s).\n`);

  for (const obj of objetos) {
    const key = obj.Key;
    const mimeType = getMimeType(key);

    if (!mimeType) {
      console.log(`⚠️  ${key} -> extensão desconhecida, pulando`);
      continue;
    }

    try {
      await r2Client.send(new CopyObjectCommand({
        Bucket: R2_BUCKET,
        CopySource: `${R2_BUCKET}/${key}`,
        Key: key,
        ContentType: mimeType,
        MetadataDirective: 'REPLACE',
      }));
      console.log(`✅ ${key} -> ${mimeType}`);
    } catch (err) {
      console.error(`❌ Erro em ${key}:`, err.message);
    }
  }

  console.log('\n✅ Correção concluída.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});