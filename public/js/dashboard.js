const ROTULOS_FAIXA = {
  vencido: 'Vencido',
  ate_7_dias: 'Ate 7 dias',
  ate_15_dias: 'Ate 15 dias',
  demais: 'Dentro do prazo',
};

function formatarData(dataIso) {
  const [ano, mes, dia] = String(dataIso).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarDiasRestantes(dias) {
  if (dias < 0) return `${Math.abs(dias)} dia(s) atras`;
  if (dias === 0) return 'Vence hoje';
  return `${dias} dia(s)`;
}

function mostrarMensagem(texto, tipo) {
  const container = document.getElementById('mensagem');
  container.innerHTML = texto ? `<div class="mensagem ${tipo}">${texto}</div>` : '';
}

function montarCartoes(resumo) {
  const cartoes = document.getElementById('cartoes');
  const dados = [
    { rotulo: 'Produtos monitorados', valor: resumo.totalMonitorado, cor: '' },
    { rotulo: 'Vencidos', valor: resumo.vencidos, cor: 'vermelho' },
    { rotulo: 'Vencem em ate 7 dias', valor: resumo.ate7Dias, cor: 'laranja' },
    { rotulo: 'Vencem em ate 15 dias', valor: resumo.ate15Dias, cor: 'amarelo' },
    { rotulo: 'Vencem em ate 30 dias', valor: resumo.ate30Dias, cor: 'verde' },
  ];

  cartoes.innerHTML = dados
    .map(
      (item) => `
      <div class="cartao ${item.cor}">
        <div class="valor">${item.valor}</div>
        <div class="rotulo">${item.rotulo}</div>
      </div>`
    )
    .join('');
}

function montarTabela(produtos) {
  const corpo = document.getElementById('corpoTabela');
  const vazio = document.getElementById('vazio');

  if (produtos.length === 0) {
    corpo.innerHTML = '';
    vazio.hidden = false;
    return;
  }

  vazio.hidden = true;
  corpo.innerHTML = produtos
    .map(
      (produto, indice) => `
      <tr data-lote-id="${produto.loteId}">
        <td>${indice + 1}</td>
        <td>${produto.descricao}</td>
        <td>${produto.codigoBarras}</td>
        <td>${produto.quantidade}</td>
        <td>${formatarData(produto.dataValidade)}</td>
        <td>${formatarDiasRestantes(produto.diasRestantes)}</td>
        <td><span class="status-pill ${produto.cor}">${ROTULOS_FAIXA[produto.faixa]}</span></td>
        <td><button class="botao-perigo" data-acao="baixa" data-lote-id="${produto.loteId}">Dar baixa</button></td>
      </tr>`
    )
    .join('');
}

async function carregarDashboard() {
  try {
    const { resumo, produtos } = await Api.buscarDashboard();
    montarCartoes(resumo);
    montarTabela(produtos);
  } catch (err) {
    mostrarMensagem(err.message, 'erro');
  }
}

document.getElementById('corpoTabela').addEventListener('click', async (evento) => {
  const botao = evento.target.closest('button[data-acao="baixa"]');
  if (!botao) return;

  const loteId = botao.dataset.loteId;
  botao.disabled = true;
  botao.textContent = 'Registrando...';

  try {
    await Api.darBaixa(loteId);
    mostrarMensagem('Baixa registrada com sucesso.', 'sucesso');
    await carregarDashboard();
  } catch (err) {
    mostrarMensagem(err.message, 'erro');
    botao.disabled = false;
    botao.textContent = 'Dar baixa';
  }
});

carregarDashboard();
