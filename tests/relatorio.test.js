const test = require('node:test');
const assert = require('node:assert/strict');
const { validarFiltros, classificarSituacao, PeriodoInvalidoError } = require('../src/services/relatorio.service');

test('aceita um periodo valido e usa "todos" como situacao padrao', () => {
  assert.deepEqual(validarFiltros({ inicio: '2026-09-01', fim: '2026-10-31' }), { inicio: '2026-09-01', fim: '2026-10-31', situacao: 'todos' });
  assert.deepEqual(validarFiltros({ inicio: '2026-10-01', fim: '2026-10-01', situacao: 'vencidos' }).situacao, 'vencidos');
});

test('TST-007.2: recusa data final anterior a data inicial', () => {
  assert.throws(() => validarFiltros({ inicio: '2026-10-31', fim: '2026-09-01' }), PeriodoInvalidoError);
});

test('recusa datas ausentes, mal formatadas ou inexistentes', () => {
  assert.throws(() => validarFiltros({ fim: '2026-10-31' }), PeriodoInvalidoError);
  assert.throws(() => validarFiltros({ inicio: '01/09/2026', fim: '2026-10-31' }), PeriodoInvalidoError);
  assert.throws(() => validarFiltros({ inicio: '2026-02-30', fim: '2026-03-10' }), PeriodoInvalidoError);
});

test('recusa situacao desconhecida', () => {
  assert.throws(() => validarFiltros({ inicio: '2026-09-01', fim: '2026-10-31', situacao: 'outra' }), PeriodoInvalidoError);
});

test('classifica o lote como vencido ou a vencer pelos dias restantes', () => {
  assert.equal(classificarSituacao(-1), 'vencido');
  assert.equal(classificarSituacao(0), 'a_vencer');
  assert.equal(classificarSituacao(15), 'a_vencer');
});
