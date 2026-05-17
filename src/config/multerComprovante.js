// Configuração do multer para comprovantes de vínculo docente
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/comprovantes');
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nome = `comprovante-${Date.now()}${ext}`;
    cb(null, nome);
  }
});

// Aceita PDF e imagens
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