const ROTULO_SITUACAO = { vencido: 'Vencido', a_vencer: 'A vencer' };
const COR_SITUACAO = { vencido: 'vermelho', a_vencer: 'verde' };
const ROTULO_ESTOQUE = { ativo: 'Ativo', baixado: 'Baixado' };

let ultimosFiltros = null;

function mostrarMensagem(texto, tipo) {
  const container = document.getElementById('mensagem');
  container.innerHTML = texto ? `<div class="mensagem ${tipo}">${escaparHtml(texto)}</div>` : '';
}

function formatarData(iso) {
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function isoLocal(data) {
  const d = new Date(data.getTime() - data.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}

function filtrosAtuais() {
  return {
    inicio: document.getElementById('inicio').value,
    fim: document.getElementById('fim').value,
    situacao: document.getElementById('situacao').value,
  };
}

function montarPrevia(relatorio) {
  const resumo = [
    { rotulo: 'Lotes no periodo', valor: relatorio.resumo.total, cor: '' },
    { rotulo: 'Vencidos', valor: relatorio.resumo.vencidos, cor: 'vermelho' },
    { rotulo: 'A vencer', valor: relatorio.resumo.aVencer, cor: 'verde' },
  ];
  document.getElementById('resumo').innerHTML = resumo
    .map((r) => `<div class="cartao ${r.cor}"><div class="valor">${r.valor}</div><div class="rotulo">${r.rotulo}</div></div>`)
    .join('');

  document.getElementById('corpoRelatorio').innerHTML = relatorio.itens
    .map(
      (i) => `
      <tr>
        <td>${escaparHtml(i.descricao)}</td>
        <td>${escaparHtml(i.codigoBarras)}</td>
        <td>${escaparHtml(i.quantidade)}</td>
        <td>${formatarData(i.dataValidade)}</td>
        <td>${escaparHtml(i.diasRestantes)}</td>
        <td><span class="status-pill ${COR_SITUACAO[i.situacao]}">${ROTULO_SITUACAO[i.situacao]}</span></td>
        <td>${ROTULO_ESTOQUE[i.statusEstoque] || escaparHtml(i.statusEstoque)}</td>
      </tr>`
    )
    .join('');
  document.getElementById('previa').hidden = false;
}

document.getElementById('formFiltros').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const filtros = filtrosAtuais();
  const botaoExportar = document.getElementById('botaoExportar');
  botaoExportar.disabled = true;
  ultimosFiltros = null;
  document.getElementById('previa').hidden = true;

  if (!filtros.inicio || !filtros.fim) {
    mostrarMensagem('Periodo invalido: informe a data inicial e a data final.', 'erro');
    return;
  }
  if (filtros.fim < filtros.inicio) {
    mostrarMensagem('Periodo invalido: a data final nao pode ser anterior a data inicial.', 'erro');
    return;
  }

  try {
    const relatorio = await Api.buscarRelatorio(filtros);
    if (relatorio.itens.length === 0) {
      mostrarMensagem('Nenhum relatorio gerado: nao ha produtos vencidos ou a vencer no periodo informado.', 'info');
      return;
    }
    montarPrevia(relatorio);
    ultimosFiltros = filtros;
    botaoExportar.disabled = false;
    mostrarMensagem(`${relatorio.itens.length} lote(s) encontrado(s). Confira a previa e clique em Exportar PDF.`, 'sucesso');
  } catch (err) {
    mostrarMensagem(err.message, 'erro');
  }
});

document.getElementById('botaoExportar').addEventListener('click', async () => {
  if (!ultimosFiltros) return;
  const botao = document.getElementById('botaoExportar');
  botao.disabled = true;
  botao.textContent = 'Gerando PDF...';
  try {
    const { blob, nomeArquivo } = await Api.baixarRelatorioPdf(ultimosFiltros);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    mostrarMensagem('Relatorio exportado com sucesso.', 'sucesso');
  } catch (err) {
    mostrarMensagem(err.message, 'erro');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Exportar PDF';
  }
});

(function preencherPeriodoPadrao() {
  const hoje = new Date();
  const inicio = new Date(hoje); inicio.setDate(hoje.getDate() - 30);
  const fim = new Date(hoje); fim.setDate(hoje.getDate() + 30);
  document.getElementById('inicio').value = isoLocal(inicio);
  document.getElementById('fim').value = isoLocal(fim);
})();
