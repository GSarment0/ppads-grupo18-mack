async function apiRequest(url, options = {}) {
  const resposta = await fetch(url, options);
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro inesperado ao comunicar com o servidor.');
  }
  return dados;
}

const Api = {
  health: () => apiRequest('/api/health'),
  importarXml: (formData) => apiRequest('/api/notas-fiscais/importar', { method: 'POST', body: formData }),
  confirmarImportacao: (payload) =>
    apiRequest('/api/notas-fiscais/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  buscarDashboard: () => apiRequest('/api/dashboard'),
};
