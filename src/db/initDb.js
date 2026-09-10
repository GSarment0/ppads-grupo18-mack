const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query(schemaSql);
    console.log('Banco de dados ValidaFIFO inicializado com sucesso (usuario, nota_fiscal, produto, lote).');
  } finally {
    client.release();
    await pool.end();
  }
}

initDb().catch((err) => {
  console.error('Falha ao inicializar o banco de dados:', err.message);
  process.exit(1);
});
