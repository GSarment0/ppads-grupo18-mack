const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

class XmlInvalidoError extends Error {}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function extrairChaveAcesso(infNFe, root) {
  const idAttr = infNFe?.['@_Id'];
  if (idAttr) {
    const chave = String(idAttr).replace(/^NFe/i, '').trim();
    if (chave.length === 44) return chave;
  }
  const chNFe = root?.protNFe?.infProt?.chNFe;
  if (chNFe) return String(chNFe).trim();
  return null;
}

function extrairCodigoEan(prod) {
  const candidatos = [prod?.cEAN, prod?.cEANTrib];
  for (const candidato of candidatos) {
    if (candidato && String(candidato).toUpperCase() !== 'SEM GTIN') {
      return String(candidato).trim();
    }
  }
  const codigoInterno = prod?.cProd;
  if (codigoInterno) return `INTERNO-${String(codigoInterno).trim()}`;
  return null;
}

/**
 * Le o XML de uma NF-e (Nota Fiscal Eletronica) e extrai a chave de acesso,
 * a data de emissao e os itens (codigo EAN, descricao e quantidade).
 * Referencia: Passo 2 (Issue #2).
 */
function parseNfeXml(xmlContent) {
  let parsed;
  try {
    parsed = parser.parse(xmlContent, true);
  } catch (err) {
    throw new XmlInvalidoError('Arquivo XML invalido ou corrompido.');
  }

  const root = parsed.nfeProc || parsed;
  const infNFe = root?.NFe?.infNFe || root?.infNFe;

  if (!infNFe) {
    throw new XmlInvalidoError('O arquivo enviado nao possui a estrutura esperada de uma NF-e.');
  }

  const chaveAcesso = extrairChaveAcesso(infNFe, root);
  if (!chaveAcesso) {
    throw new XmlInvalidoError('Nao foi possivel identificar a chave de acesso da nota fiscal.');
  }

  const dataEmissaoBruta = infNFe?.ide?.dhEmi || infNFe?.ide?.dEmi || null;
  const dataEmissao = dataEmissaoBruta ? String(dataEmissaoBruta).slice(0, 10) : null;

  const detalhes = asArray(infNFe.det);
  if (detalhes.length === 0) {
    throw new XmlInvalidoError('A nota fiscal nao possui itens (tag <det>) para importar.');
  }

  const itens = detalhes.map((det) => {
    const prod = det.prod || {};
    const codigoEan = extrairCodigoEan(prod);
    const descricao = prod.xProd ? String(prod.xProd).trim() : null;
    const quantidade = prod.qCom !== undefined ? Math.trunc(Number(prod.qCom)) : null;

    if (!codigoEan || !descricao || !quantidade || quantidade <= 0) {
      throw new XmlInvalidoError('Um ou mais itens da nota fiscal estao com dados incompletos (EAN, descricao ou quantidade).');
    }

    return { codigoEan, descricao, quantidade };
  });

  return { chaveAcesso, dataEmissao, itens };
}

module.exports = { parseNfeXml, XmlInvalidoError };
