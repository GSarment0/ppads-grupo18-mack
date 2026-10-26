// Dados vindos do XML/banco sao inseridos em HTML: sempre escapar para evitar injecao de script.
function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function apiRequest(url, options = {}) {
  const resposta = await fetch(url, options);
  if (resposta.status === 401) {
    window.location.href = 'login.html';
    throw new Error('Sessao expirada. Faca login novamente.');
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro inesperado ao comunicar com o servidor.');
  }
  return dados;
}

const Api = {
  health: () => apiRequest('/api/health'),
  usuarioAtual: () => apiRequest('/api/auth/me'),
  importarXml: (formData) => apiRequest('/api/notas-fiscais/importar', { method: 'POST', body: formData }),
  confirmarImportacao: (payload) =>
    apiRequest('/api/notas-fiscais/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  buscarDashboard: () => apiRequest('/api/dashboard'),
  darBaixa: (loteId) => apiRequest(`/api/lotes/${loteId}/baixa`, { method: 'PATCH' }),
};
