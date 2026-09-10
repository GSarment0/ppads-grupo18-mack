const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isXml = file.mimetype.includes('xml') || file.originalname.toLowerCase().endsWith('.xml');
    if (!isXml) {
      return cb(new Error('Apenas arquivos .xml sao aceitos.'));
    }
    cb(null, true);
  },
});

module.exports = upload;
