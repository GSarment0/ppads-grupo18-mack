const pool = require('../config/db');

class PeriodoInvalidoError extends Error {}

const SITUACOES = ['todos', 'vencidos', 'a_vencer'];
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function dataValida(texto) {
  if (!FORMATO_DATA.test(String(texto || ''))) return false;
  const d = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

/**
 * Valida os filtros do relatorio. Referencia: Passo 8 (Issue #8) e TST-007.2.
 */
function validarFiltros({ inicio, fim, situacao }) {
  if (!dataValida(inicio) || !dataValida(fim)) {
    throw new PeriodoInvalidoError('Periodo invalido: informe a data inicial e a data final.');
  }
  if (fim < inicio) {
    throw new PeriodoInvalidoError('Periodo invalido: a data final nao pode ser anterior a data inicial.');
  }
  const sit = situacao || 'todos';
  if (!SITUACOES.includes(sit)) {
    throw new PeriodoInvalidoError('Situacao invalida: use todos, vencidos ou a_vencer.');
  }
  return { inicio, fim, situacao: sit };
}

function classificarSituacao(diasRestantes) {
  return diasRestantes < 0 ? 'vencido' : 'a_vencer';
}

/**
 * Consulta o historico de lotes cuja data de validade esta no periodo informado,
 * incluindo lotes ja baixados, ordenados pela validade (FIFO).
 */
async function gerarRelatorio(filtros) {
  const { inicio, fim, situacao } = validarFiltros(filtros);
  const { rows } = await pool.query(
    `SELECT l.id, p.descricao, p.codigo_barras, l.quantidade, l.status,
            TO_CHAR(l.data_validade, 'YYYY-MM-DD') AS data_validade,
            (l.data_validade - CURRENT_DATE) AS dias_restantes
       FROM lote l
       JOIN produto p ON p.id = l.produto_id
      WHERE l.data_validade BETWEEN $1 AND $2
      ORDER BY l.data_validade ASC, p.descricao ASC`,
    [inicio, fim]
  );

  const itens = rows
    .map((row) => ({
      loteId: row.id,
      descricao: row.descricao,
      codigoBarras: row.codigo_barras,
      quantidade: Number(row.quantidade),
      dataValidade: row.data_validade,
      diasRestantes: Number(row.dias_restantes),
      situacao: classificarSituacao(Number(row.dias_restantes)),
      statusEstoque: row.status,
    }))
    .filter((item) => situacao === 'todos' || (situacao === 'vencidos' ? item.situacao === 'vencido' : item.situacao === 'a_vencer'));

  return {
    filtros: { inicio, fim, situacao },
    geradoEm: new Date().toISOString(),
    resumo: {
      total: itens.length,
      vencidos: itens.filter((i) => i.situacao === 'vencido').length,
      aVencer: itens.filter((i) => i.situacao === 'a_vencer').length,
    },
    itens,
  };
}

module.exports = { PeriodoInvalidoError, validarFiltros, classificarSituacao, gerarRelatorio };
