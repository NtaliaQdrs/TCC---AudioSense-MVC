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
    cb(null, `midias/midia-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens e vídeos são permitidos.'));
  }
};

const uploadMidia = multer({ storage, fileFilter });
export default uploadMidia;