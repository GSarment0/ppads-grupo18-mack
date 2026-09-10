const express = require('express');
const upload = require('../middleware/upload');
const { parseNfeXml, XmlInvalidoError } = require('../services/xmlParser.service');

const router = express.Router();

// Passo 2 (Issue #2): le o XML enviado e retorna os itens extraidos, sem gravar no banco.
router.post('/importar', upload.single('arquivoXml'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo XML foi enviado.' });
  }

  try {
    const xmlContent = req.file.buffer.toString('utf8');
    const resultado = parseNfeXml(xmlContent);
    return res.status(200).json(resultado);
  } catch (err) {
    if (err instanceof XmlInvalidoError) {
      return res.status(422).json({ erro: err.message });
    }
    console.error('Erro ao processar XML:', err);
    return res.status(500).json({ erro: 'Erro inesperado ao processar o arquivo XML.' });
  }
});

module.exports = router;
