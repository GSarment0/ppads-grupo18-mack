const pool = require('../config/db');

/**
 * Classifica um lote em uma faixa de vencimento e na cor correspondente.
 * Regras (Passo 4 / Issue #4):
 *  - vencido           -> vermelho
 *  - ate 7 dias        -> laranja
 *  - ate 15 dias       -> amarelo
 *  - restante (>15d)   -> verde
 */
function classificarFaixa(diasRestantes) {
  if (diasRestantes < 0) return { faixa: 'vencido', cor: 'vermelho' };
  if (diasRestantes <= 7) return { faixa: 'ate_7_dias', cor: 'laranja' };
  if (diasRestantes <= 15) return { faixa: 'ate_15_dias', cor: 'amarelo' };
  return { faixa: 'demais', cor: 'verde' };
}

/**
 * Busca os lotes ativos ordenados por data de validade (a logica FIFO:
 * "primeiro que vence, primeiro a sair"), calcula os dias restantes e
 * monta o resumo por faixa exibido nos cartoes do dashboard.
 */
async function obterDashboard() {
  const { rows } = await pool.query(
    `SELECT l.id, l.quantidade, l.data_validade, p.codigo_barras, p.descricao
     FROM lote l
     JOIN produto p ON p.id = l.produto_id
     WHERE l.status = 'ativo'
     ORDER BY l.data_validade ASC`
  );

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const produtos = rows.map((row) => {
    const dataValidade = new Date(row.data_validade);
    dataValidade.setHours(0, 0, 0, 0);
    const diasRestantes = Math.round((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const { faixa, cor } = classificarFaixa(diasRestantes);

    return {
      loteId: row.id,
      codigoBarras: row.codigo_barras,
      descricao: row.descricao,
      quantidade: Number(row.quantidade),
      dataValidade: row.data_validade,
      diasRestantes,
      faixa,
      cor,
    };
  });

  const resumo = {
    totalMonitorado: produtos.length,
    vencidos: produtos.filter((p) => p.diasRestantes < 0).length,
    ate7Dias: produtos.filter((p) => p.diasRestantes >= 0 && p.diasRestantes <= 7).length,
    ate15Dias: produtos.filter((p) => p.diasRestantes > 7 && p.diasRestantes <= 15).length,
    ate30Dias: produtos.filter((p) => p.diasRestantes > 15 && p.diasRestantes <= 30).length,
  };

  return { resumo, produtos };
}

module.exports = { obterDashboard, classificarFaixa };
