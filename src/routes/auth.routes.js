const express = require('express');
const { autenticar, gerarToken, DURACAO_SESSAO_MS } = require('../services/auth.service');
const { COOKIE_SESSAO, exigirAutenticacaoApi } = require('../middleware/auth');

const router = express.Router();

function opcoesCookie(req) {
  return { httpOnly: true, sameSite: 'lax', secure: req.secure, path: '/' };
}

// Passo 7 (Issue #7): valida e-mail e senha no banco e abre a sessao.
router.post('/login', async (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe o e-mail e a senha.' });
  }

  try {
    const usuario = await autenticar(email, senha);
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais invalidas. Verifique o e-mail e a senha.' });
    }
    res.cookie(COOKIE_SESSAO, gerarToken(usuario), { ...opcoesCookie(req), maxAge: DURACAO_SESSAO_MS });
    return res.status(200).json({ usuario: { nome: usuario.nome, email: usuario.email } });
  } catch (err) {
    console.error('Erro ao autenticar:', err);
    return res.status(500).json({ erro: 'Erro ao validar as credenciais.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_SESSAO, opcoesCookie(req));
  return res.status(200).json({ mensagem: 'Sessao encerrada.' });
});

router.get('/me', exigirAutenticacaoApi, (req, res) => {
  return res.status(200).json({ usuario: { nome: req.usuario.nome, email: req.usuario.email } });
});

module.exports = router;
