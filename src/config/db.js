require('dotenv').config();
const { Pool } = require('pg');

const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

// Se DATABASE_URL estiver definida (ex.: "External Database URL" do Render), usa ela direto.
// Caso contrario, monta a conexao a partir das variaveis separadas (uso local).
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'validafifo',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl,
    });

module.exports = pool;
