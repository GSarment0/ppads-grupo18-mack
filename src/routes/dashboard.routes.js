const express = require('express');
const { obterDashboard } = require('../services/dashboard.service');

const router = express.Router();

// Passo 4 (Issue #4): lotes ativos ordenados por vencimento (FIFO) + resumo por faixa/cor.
router.get('/', async (req, res) => {
  try {
    const dashboard = await obterDashboard();
    return res.status(200).json(dashboard);
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
    return res.status(500).json({ erro: 'Erro ao carregar o dashboard de vencimentos.' });
  }
});

module.exports = router;
