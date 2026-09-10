let notaImportada = null;

function mostrarMensagem(texto, tipo) {
  const container = document.getElementById('mensagem');
  container.innerHTML = texto ? `<div class="mensagem ${tipo}">${texto}</div>` : '';
}

function montarLinhasItens(itens) {
  const corpo = document.getElementById('corpoItens');
  corpo.innerHTML = itens
    .map(
      (item, indice) => `
      <tr data-indice="${indice}">
        <td>${item.codigoEan}</td>
        <td>${item.descricao}</td>
        <td>${item.quantidade}</td>
        <td><input type="date" class="input-validade" required /></td>
      </tr>`
    )
    .join('');
}

document.getElementById('inputArquivo').addEventListener('change', async (evento) => {
  const arquivo = evento.target.files[0];
  if (!arquivo) return;

  mostrarMensagem('Lendo arquivo XML...', 'info');
  document.getElementById('secaoItens').hidden = true;

  const formData = new FormData();
  formData.append('arquivoXml', arquivo);

  try {
    const resultado = await Api.importarXml(formData);
    notaImportada = resultado;
    montarLinhasItens(resultado.itens);
    document.getElementById('secaoItens').hidden = false;
    mostrarMensagem(
      `Nota fiscal lida com sucesso: ${resultado.itens.length} item(ns) identificado(s). Informe a validade de cada produto.`,
      'sucesso'
    );
  } catch (err) {
    notaImportada = null;
    mostrarMensagem(err.message, 'erro');
  }
});

document.getElementById('botaoSalvar').addEventListener('click', async () => {
  if (!notaImportada) return;

  const linhas = Array.from(document.querySelectorAll('#corpoItens tr'));
  const inputsSemData = linhas.filter((linha) => !linha.querySelector('.input-validade').value);
  if (inputsSemData.length > 0) {
    mostrarMensagem('Informe a data de validade de todos os produtos antes de salvar.', 'erro');
    return;
  }

  const hojeIso = new Date().toISOString().slice(0, 10);
  const itensComDataPassada = linhas.filter((linha) => linha.querySelector('.input-validade').value < hojeIso);
  if (itensComDataPassada.length > 0) {
    const confirmar = confirm(
      `${itensComDataPassada.length} produto(s) foram informados com data de validade ja vencida. Deseja continuar mesmo assim?`
    );
    if (!confirmar) return;
  }

  const itens = linhas.map((linha, indice) => ({
    ...notaImportada.itens[indice],
    dataValidade: linha.querySelector('.input-validade').value,
  }));

  const botaoSalvar = document.getElementById('botaoSalvar');
  botaoSalvar.disabled = true;
  botaoSalvar.textContent = 'Salvando...';

  try {
    await Api.confirmarImportacao({
      chaveAcesso: notaImportada.chaveAcesso,
      dataEmissao: notaImportada.dataEmissao,
      itens,
    });
    mostrarMensagem('Produtos e lotes cadastrados com sucesso! Redirecionando para o dashboard...', 'sucesso');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  } catch (err) {
    mostrarMensagem(err.message, 'erro');
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = 'Salvar cadastro';
  }
});
