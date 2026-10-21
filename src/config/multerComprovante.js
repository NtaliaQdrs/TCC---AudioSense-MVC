import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { r2Client, R2_BUCKET } from '../config/storage.js';

const storage = multerS3({
  s3: r2Client,
  bucket: R2_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `comprovantes/comprovante-${Date.now()}${ext}`);
  }
});

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