require('dotenv').config();
const path = require('path');
const express = require('express');
const pool = require('./src/config/db');

const notaFiscalRoutes = require('./src/routes/notaFiscal.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({ status: 'ok', banco: 'conectado' });
  } catch (err) {
    return res.status(500).json({ status: 'erro', banco: 'desconectado', detalhe: err.message });
  }
});

app.use('/api/notas-fiscais', notaFiscalRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ erro: err.message || 'Requisicao invalida.' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`ValidaFIFO rodando em http://localhost:${PORT}`);
});
