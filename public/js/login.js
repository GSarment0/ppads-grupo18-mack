function mostrarMensagem(texto, tipo) {
  const container = document.getElementById('mensagem');
  container.innerHTML = '';
  if (!texto) return;
  const div = document.createElement('div');
  div.className = `mensagem ${tipo}`;
  div.textContent = texto;
  container.appendChild(div);
}

document.getElementById('formLogin').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  if (!email || !senha) {
    mostrarMensagem('Informe o e-mail e a senha.', 'erro');
    return;
  }

  const botao = document.getElementById('botaoEntrar');
  botao.disabled = true;
  botao.textContent = 'Entrando...';

  try {
    const resposta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) throw new Error(dados.erro || 'Nao foi possivel entrar.');
    window.location.href = 'dashboard.html';
  } catch (err) {
    mostrarMensagem(err.message, 'erro');
    botao.disabled = false;
    botao.textContent = 'Entrar';
  }
});
