const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { parseNfeXml, XmlInvalidoError } = require('../src/services/xmlParser.service');

const xmlValido = fs.readFileSync(path.join(__dirname, 'fixtures', 'nfe-exemplo.xml'), 'utf8');
const xmlInvalido = fs.readFileSync(path.join(__dirname, 'fixtures', 'nfe-invalida.xml'), 'utf8');

test('extrai a chave de acesso, a data de emissao e os itens de uma NF-e valida', () => {
  const resultado = parseNfeXml(xmlValido);

  assert.equal(resultado.chaveAcesso, '35240114200166000187550010000001231000000010');
  assert.equal(resultado.dataEmissao, '2026-09-05');
  assert.equal(resultado.itens.length, 3);
});

test('extrai corretamente o EAN, a descricao e a quantidade de cada item', () => {
  const resultado = parseNfeXml(xmlValido);
  const [item1, item2, item3] = resultado.itens;

  assert.deepEqual(item1, { codigoEan: '7891000100103', descricao: 'Leite Integral 1L', quantidade: 18 });
  assert.deepEqual(item2, { codigoEan: '7891000200104', descricao: 'Iogurte Natural 170g', quantidade: 24 });

  // Item sem cEAN ("SEM GTIN"): deve recorrer ao cEANTrib.
  assert.equal(item3.codigoEan, '7891000300105');
  assert.equal(item3.quantidade, 12);
});

test('preserva quantidades decimais (produtos vendidos por peso)', () => {
  const xmlPeso = xmlValido.replace('<qCom>18.0000</qCom>', '<qCom>1.5000</qCom>');
  assert.equal(parseNfeXml(xmlPeso).itens[0].quantidade, 1.5);
});

test('rejeita um arquivo XML que nao segue a estrutura de uma NF-e', () => {
  assert.throws(() => parseNfeXml(xmlInvalido), XmlInvalidoError);
});

test('rejeita um conteudo que nao e XML valido', () => {
  assert.throws(() => parseNfeXml('isto nao e xml <<<'), XmlInvalidoError);
});
