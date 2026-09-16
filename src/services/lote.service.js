const pool = require('../config/db');

/**
 * Registra a baixa de um lote (vendido, descartado ou promovido), retirando-o
 * do acompanhamento ativo. Referencia: Passo 5 (Issue #5).
 */
async function registrarBaixa(loteId) {
  const { rows } = await pool.query(
    `UPDATE lote SET status = 'baixado'
     WHERE id = $1 AND status = 'ativo'
     RETURNING id`,
    [loteId]
  );
  return rows.length > 0;
}

module.exports = { registrarBaixa };
