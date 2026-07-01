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
    cb(null, `audios/audio-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de áudio são permitidos.'));
  }
};

const uploadAudio = multer({ storage, fileFilter });
export default uploadAudio;