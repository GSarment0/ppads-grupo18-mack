require('dotenv').config();
const path = require('path');
const express = require('express');
const pool = require('./src/config/db');

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

app.listen(PORT, () => {
  console.log(`ValidaFIFO rodando em http://localhost:${PORT}`);
});
