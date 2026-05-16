// Configuração do multer — define como e onde os arquivos enviados serão salvos
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  
  // Define a pasta onde as fotos serão salvas
  destination: (req, file, cb) => {
    cb(null, 'public/images/fotos-perfil');
  },

  // Define o nome do arquivo salvo — usa o id da sessão + timestamp para evitar duplicatas
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // pega a extensão (.jpg, .png, etc)
    const nome = `usuario-${req.session.usuarioId}-${Date.now()}${ext}`;
    cb(null, nome);
  }
});

// Filtro — aceita só imagens
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