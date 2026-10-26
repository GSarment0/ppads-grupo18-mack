const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { salvarUsuario } = require('../services/auth.service');

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query(schemaSql);
    console.log('Banco de dados ValidaFIFO inicializado com sucesso (usuario, nota_fiscal, produto, lote).');

    // Usuario inicial opcional, util em hospedagens sem acesso ao terminal (ex.: plano gratuito do Render).
    const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      const resultado = await salvarUsuario(client, { nome: ADMIN_NOME || 'Administrador', email: ADMIN_EMAIL, senha: ADMIN_PASSWORD });
      console.log(`Usuario inicial ${ADMIN_EMAIL} ${resultado.criado ? 'criado' : 'atualizado'}.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

initDb().catch((err) => {
  console.error('Falha ao inicializar o banco de dados:', err.message);
  process.exit(1);
});
