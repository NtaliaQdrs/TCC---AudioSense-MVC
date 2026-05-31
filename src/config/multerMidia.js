import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/midias');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `midia-${Date.now()}${ext}`);
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