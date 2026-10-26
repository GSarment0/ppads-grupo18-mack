require('dotenv').config();
const path = require('path');
const express = require('express');
const pool = require('./src/config/db');

const authRoutes = require('./src/routes/auth.routes');
const notaFiscalRoutes = require('./src/routes/notaFiscal.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const loteRoutes = require('./src/routes/lote.routes');
const relatorioRoutes = require('./src/routes/relatorio.routes');
const { exigirAutenticacaoApi, exigirAutenticacaoPagina } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Necessario atras do proxy HTTPS do Render para que req.secure seja verdadeiro.
app.set('trust proxy', 1);

app.use(express.json());
app.use(exigirAutenticacaoPagina);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({ status: 'ok', banco: 'conectado' });
  } catch (err) {
    return res.status(500).json({ status: 'erro', banco: 'desconectado', detalhe: err.message });
  }
});

app.use('/api/auth', authRoutes);

app.use('/api', exigirAutenticacaoApi);
app.use('/api/notas-fiscais', notaFiscalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lotes', loteRoutes);
app.use('/api/relatorios', relatorioRoutes);

app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ erro: err.message || 'Requisicao invalida.' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`ValidaFIFO API + Web App rodando em http://localhost:${PORT}`);
});
