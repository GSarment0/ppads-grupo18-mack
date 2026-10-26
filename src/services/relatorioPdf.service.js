const PDFDocument = require('pdfkit');

const ROTULO_SITUACAO = { todos: 'Todos', vencidos: 'Vencidos', a_vencer: 'A vencer' };
const ROTULO_ITEM = { vencido: 'Vencido', a_vencer: 'A vencer' };
const ROTULO_ESTOQUE = { ativo: 'Ativo', baixado: 'Baixado' };

const COLUNAS = [
  { titulo: 'Produto', largura: 165, campo: (i) => i.descricao },
  { titulo: 'Código (EAN)', largura: 92, campo: (i) => i.codigoBarras },
  { titulo: 'Qtd.', largura: 40, campo: (i) => String(i.quantidade).replace('.', ','), alinhar: 'right' },
  { titulo: 'Validade', largura: 58, campo: (i) => formatarData(i.dataValidade) },
  { titulo: 'Dias', largura: 36, campo: (i) => String(i.diasRestantes), alinhar: 'right' },
  { titulo: 'Situação', largura: 52, campo: (i) => ROTULO_ITEM[i.situacao] },
  { titulo: 'Estoque', largura: 52, campo: (i) => ROTULO_ESTOQUE[i.statusEstoque] || i.statusEstoque },
];

function formatarData(iso) {
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

/**
 * Gera o arquivo PDF do relatorio de vencimentos. Referencia: Passo 8 (Issue #8) e UC07.
 */
function gerarPdfRelatorio(relatorio, nomeUsuario) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true, info: { Title: 'Relatório de Vencimentos - ValidaFIFO' } });
    const partes = [];
    doc.on('data', (p) => partes.push(p));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);

    const esquerda = doc.page.margins.left;
    const larguraTotal = COLUNAS.reduce((s, c) => s + c.largura, 0);

    doc.font('Helvetica-Bold').fontSize(16).fillColor('#1e3a8a').text('Relatório de Vencimentos', { align: 'left' });
    doc.font('Helvetica').fontSize(10).fillColor('#1f2430').moveDown(0.3);
    doc.text(`ValidaFIFO - Controle de validade e gestão FIFO`);
    doc.text(`Período: ${formatarData(relatorio.filtros.inicio)} a ${formatarData(relatorio.filtros.fim)}`);
    doc.text(`Situação: ${ROTULO_SITUACAO[relatorio.filtros.situacao]}`);
    doc.text(`Gerado em: ${formatarDataHora(relatorio.geradoEm)}${nomeUsuario ? ` por ${nomeUsuario}` : ''}`);
    doc.moveDown(0.6);
    doc.font('Helvetica-Bold').text(
      `Total de lotes: ${relatorio.resumo.total}    Vencidos: ${relatorio.resumo.vencidos}    A vencer: ${relatorio.resumo.aVencer}`
    );
    doc.moveDown(0.8);

    const desenharCabecalho = () => {
      const y = doc.y;
      doc.rect(esquerda, y, larguraTotal, 18).fill('#1e3a8a');
      let x = esquerda;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff');
      for (const col of COLUNAS) {
        doc.text(col.titulo, x + 4, y + 5, { width: col.largura - 8, align: col.alinhar || 'left' });
        x += col.largura;
      }
      doc.y = y + 18;
    };

    desenharCabecalho();
    doc.font('Helvetica').fontSize(8.5);
    relatorio.itens.forEach((item, indice) => {
      const valores = COLUNAS.map((c) => String(c.campo(item) ?? ''));
      const altura = Math.max(...COLUNAS.map((c, k) => doc.heightOfString(valores[k], { width: c.largura - 8 }))) + 8;
      if (doc.y + altura > doc.page.height - doc.page.margins.bottom - 20) {
        doc.addPage();
        desenharCabecalho();
        doc.font('Helvetica').fontSize(8.5);
      }
      const y = doc.y;
      if (indice % 2 === 1) doc.rect(esquerda, y, larguraTotal, altura).fill('#f4f5f7');
      let x = esquerda;
      COLUNAS.forEach((col, k) => {
        const cor = col.titulo === 'Situação' && item.situacao === 'vencido' ? '#dc2626' : '#1f2430';
        doc.fillColor(cor).text(valores[k], x + 4, y + 4, { width: col.largura - 8, align: col.alinhar || 'left' });
        x += col.largura;
      });
      doc.moveTo(esquerda, y + altura).lineTo(esquerda + larguraTotal, y + altura).lineWidth(0.5).strokeColor('#e2e5ea').stroke();
      doc.y = y + altura;
    });

    const paginas = doc.bufferedPageRange();
    for (let i = 0; i < paginas.count; i++) {
      doc.switchToPage(paginas.start + i);
      const rodapeY = doc.page.height - doc.page.margins.bottom + 15;
      doc.font('Helvetica').fontSize(8).fillColor('#6b7280')
        .text(`Página ${i + 1} de ${paginas.count}`, esquerda, rodapeY, { width: larguraTotal, align: 'center', lineBreak: false });
    }
    doc.end();
  });
}

module.exports = { gerarPdfRelatorio };
