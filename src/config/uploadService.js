/**
 * uploadService.js
 *
 * Serviço centralizado de upload de arquivos.
 * Hoje salva localmente em public/uploads.
 * Para migrar para nuvem (Cloudinary, S3, etc.):
 *   1. Instale o SDK do serviço escolhido
 *   2. Substitua a função `salvarArquivo` abaixo
 *   3. Todos os uploads do sistema passam a usar nuvem automaticamente
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuração local ───────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

// Garante que a pasta existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Cria um middleware multer para uma subpasta específica.
 * Uso: uploadService.criarUpload('posters').single('poster')
 *
 * @param {string} subpasta - Ex: 'posters', 'comprovantes', 'audios'
 * @param {string[]} tiposPermitidos - Ex: ['image/jpeg', 'image/png']
 */
export const criarUpload = (subpasta = '', tiposPermitidos = []) => {
  const destino = path.join(UPLOAD_DIR, subpasta);

  if (!fs.existsSync(destino)) {
    fs.mkdirSync(destino, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destino),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const nome = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      cb(null, nome);
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

  return multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
};

/**
 * Retorna a URL pública de um arquivo.
 * Quando migrar para nuvem, essa função retornará a URL do serviço.
 *
 * @param {string} subpasta - Ex: 'posters'
 * @param {string} filename - Nome do arquivo salvo
 */
export const getUrlArquivo = (subpasta, filename) => {
  if (!filename) return null;
  return `/uploads/${subpasta}/${filename}`;
};

/**
 * Remove um arquivo local.
 * Quando migrar para nuvem, chamar a API de deleção do serviço aqui.
 *
 * @param {string} subpasta
 * @param {string} filename
 */
export const deletarArquivo = (subpasta, filename) => {
  if (!filename) return;
  const filePath = path.join(UPLOAD_DIR, subpasta, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};