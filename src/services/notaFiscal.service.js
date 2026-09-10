const pool = require('../config/db');

/**
 * Confirma a importacao de uma nota fiscal ja lida (ver xmlParser.service.js):
 * - grava (ou reaproveita) a NotaFiscal pela chave de acesso;
 * - para cada item, verifica se o Produto ja existe pelo EAN (se nao existir, cadastra);
 * - grava o Lote completo (quantidade + data de validade) vinculado ao produto e a nota.
 * Referencia: Passo 3 (Issue #3).
 */
async function confirmarImportacao({ chaveAcesso, dataEmissao, itens }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const notaResult = await client.query(
      `INSERT INTO nota_fiscal (chave_acesso, data_emissao)
       VALUES ($1, $2)
       ON CONFLICT (chave_acesso) DO UPDATE SET chave_acesso = EXCLUDED.chave_acesso
       RETURNING id`,
      [chaveAcesso, dataEmissao]
    );
    const notaFiscalId = notaResult.rows[0].id;

    const lotesCriados = [];

    for (const item of itens) {
      const { codigoEan, descricao, quantidade, dataValidade } = item;

      if (!dataValidade) {
        throw new Error(`Data de validade obrigatoria para o produto "${descricao}".`);
      }

      const dataInformada = new Date(`${dataValidade}T00:00:00`);
      if (Number.isNaN(dataInformada.getTime())) {
        throw new Error(`Data de validade invalida para o produto "${descricao}".`);
      }

      const produtoResult = await client.query(
        `INSERT INTO produto (codigo_barras, descricao)
         VALUES ($1, $2)
         ON CONFLICT (codigo_barras) DO UPDATE SET descricao = EXCLUDED.descricao
         RETURNING id`,
        [codigoEan, descricao]
      );
      const produtoId = produtoResult.rows[0].id;

      const loteResult = await client.query(
        `INSERT INTO lote (produto_id, nota_fiscal_id, quantidade, data_validade, status)
         VALUES ($1, $2, $3, $4, 'ativo')
         RETURNING id`,
        [produtoId, notaFiscalId, quantidade, dataValidade]
      );

      lotesCriados.push({ loteId: loteResult.rows[0].id, produtoId, codigoEan, descricao, quantidade, dataValidade });
    }

    await client.query('COMMIT');
    return { notaFiscalId, lotes: lotesCriados };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { confirmarImportacao };
