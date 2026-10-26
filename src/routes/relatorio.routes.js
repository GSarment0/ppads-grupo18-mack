const express = require('express');
const { gerarRelatorio, PeriodoInvalidoError } = require('../services/relatorio.service');
const { gerarPdfRelatorio } = require('../services/relatorioPdf.service');

const router = express.Router();

function tratarErro(res, err) {
  if (err instanceof PeriodoInvalidoError) {
    return res.status(400).json({ erro: err.message });
  }
  console.error('Erro ao gerar relatorio:', err);
  return res.status(500).json({ erro: 'Erro ao gerar o relatorio de vencimentos.' });
}

// Passo 8 (Issue #8): previa do relatorio (historico de lotes no periodo).
router.get('/', async (req, res) => {
  try {
    const relatorio = await gerarRelatorio(req.query);
    return res.status(200).json(relatorio);
  } catch (err) {
    return tratarErro(res, err);
  }
});

// Passo 8 (Issue #8): arquivo PDF para download.
router.get('/pdf', async (req, res) => {
  try {
    const relatorio = await gerarRelatorio(req.query);
    if (relatorio.itens.length === 0) {
      return res.status(404).json({ erro: 'Nenhum relatorio gerado: nao ha produtos vencidos ou a vencer no periodo informado.' });
    }
    const pdf = await gerarPdfRelatorio(relatorio, req.usuario && req.usuario.nome);
    const nome = `relatorio-vencimentos-${relatorio.filtros.inicio}-a-${relatorio.filtros.fim}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nome}"`);
    return res.status(200).send(pdf);
  } catch (err) {
    return tratarErro(res, err);
  }
});

module.exports = router;
