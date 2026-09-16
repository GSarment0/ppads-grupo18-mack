const express = require('express');
const { registrarBaixa } = require('../services/lote.service');

const router = express.Router();

// Passo 5 (Issue #5): botao "Dar Baixa" - altera o status do lote e remove da exibicao.
router.patch('/:id/baixa', async (req, res) => {
  const loteId = Number(req.params.id);
  if (!Number.isInteger(loteId)) {
    return res.status(400).json({ erro: 'Identificador de lote invalido.' });
  }

  try {
    const sucesso = await registrarBaixa(loteId);
    if (!sucesso) {
      return res.status(404).json({ erro: 'Lote nao encontrado ou ja baixado.' });
    }
    return res.status(200).json({ mensagem: 'Baixa registrada com sucesso.' });
  } catch (err) {
    console.error('Erro ao registrar baixa:', err);
    return res.status(500).json({ erro: 'Erro ao registrar a baixa do lote.' });
  }
});

module.exports = router;
