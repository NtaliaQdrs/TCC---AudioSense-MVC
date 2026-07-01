/**
 * uploadService.js
 *
 * Serviço centralizado de upload de arquivos.
 * Agora salva na nuvem via Cloudflare R2 (S3-compatible).
 */

import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from './storage.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Cria um middleware multer para uma subpasta específica (agora um "prefixo" no bucket R2).
 * Uso: uploadService.criarUpload('posters', ['image/jpeg']).single('poster')
 *
 * @param {string} subpasta - Ex: 'posters', 'comprovantes', 'audios'
 * @param {string[]} tiposPermitidos - Ex: ['image/jpeg', 'image/png']
 */
export const criarUpload = (subpasta = '', tiposPermitidos = []) => {
  const storage = multerS3({
    s3: r2Client,
    bucket: R2_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const nome = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      cb(null, `${subpasta}/${nome}`);
    }
  });

  const fileFilter = tiposPermitidos.length
    ? (req, file, cb) => {
        if (tiposPermitidos.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
        }
      }
    : undefined;

  return multer({ storage, fileFilter, limits: { fileSize: 800 * 1024 * 1024 } });
};

/**
 * Retorna a URL pública de um arquivo salvo no R2.
 *
 * @param {string} subpasta - Ex: 'posters'
 * @param {string} filename - Nome do arquivo salvo (sem a subpasta)
 */
export const getUrlArquivo = (subpasta, filename) => {
  if (!filename) return null;
  return `${R2_PUBLIC_URL}/${subpasta}/${filename}`;
};

/**
 * Remove um arquivo do bucket R2.
 *
 * @param {string} subpasta
 * @param {string} filename
 */
export const deletarArquivo = async (subpasta, filename) => {
  if (!filename) return;
  await r2Client.send(new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: `${subpasta}/${filename}`,
  }));
};