// Preenche o usuario logado na barra lateral e trata o botao "Sair".
(async function iniciarSessao() {
  const nome = document.getElementById('nomeUsuario');
  try {
    const { usuario } = await Api.usuarioAtual();
    if (nome) nome.textContent = usuario.nome;
  } catch {
    // apiRequest ja redireciona para o login em caso de sessao expirada.
  }

  const botaoSair = document.getElementById('botaoSair');
  if (botaoSair) {
    botaoSair.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = 'login.html';
    });
  }
})();
