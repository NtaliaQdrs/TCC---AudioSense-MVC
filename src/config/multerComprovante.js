import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { r2Client, R2_BUCKET, STORAGE_CONFIGURED } from '../config/storage.js';

const storage = STORAGE_CONFIGURED
  ? multerS3({
      s3: r2Client,
      bucket: R2_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `comprovantes/comprovante-${Date.now()}${ext}`);
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
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas PDF, JPG, PNG ou WEBP são permitidos.'));
  }
};

const uploadComprovante = multer({ storage, fileFilter });

export default uploadComprovante;