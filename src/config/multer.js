import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { r2Client, R2_BUCKET, STORAGE_CONFIGURED } from './storage.js';

const storage = STORAGE_CONFIGURED
  ? multerS3({
      s3: r2Client,
      bucket: R2_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `fotos-perfil/usuario-${Date.now()}${ext}`);
      }
    })
  : {
      _handleFile(req, file, cb) {
        cb(new Error('O armazenamento de arquivos não está configurado.'));
      },
      _removeFile(req, file, cb) {
        cb(null);
      }
    };

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens JPG, PNG ou WEBP são permitidas.'));
  }
};

const upload = multer({ storage, fileFilter });

export default upload;