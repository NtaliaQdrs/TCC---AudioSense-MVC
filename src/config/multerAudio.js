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
        cb(null, `audios/audio-${Date.now()}${ext}`);
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
  const tiposPermitidos = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de áudio são permitidos.'));
  }
};

const uploadAudio = multer({ storage, fileFilter });
export default uploadAudio;