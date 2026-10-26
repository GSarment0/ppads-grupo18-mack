const { validarToken } = require('../services/auth.service');

const COOKIE_SESSAO = 'validafifo_sessao';

function lerCookie(req, nome) {
  const cabecalho = req.headers.cookie || '';
  for (const parte of cabecalho.split(';')) {
    const [chave, ...valor] = parte.trim().split('=');
    if (chave === nome) return decodeURIComponent(valor.join('='));
  }
  return null;
}

function usuarioDaRequisicao(req) {
  return validarToken(lerCookie(req, COOKIE_SESSAO));
}

// Protege os endpoints da API: sem sessao valida, responde 401.
function exigirAutenticacaoApi(req, res, next) {
  const usuario = usuarioDaRequisicao(req);
  if (!usuario) {
    return res.status(401).json({ erro: 'Sessao expirada ou usuario nao autenticado. Faca login novamente.' });
  }
  req.usuario = usuario;
  next();
}

// Protege as paginas HTML: sem sessao valida, redireciona para a tela de login.
function exigirAutenticacaoPagina(req, res, next) {
  const caminho = req.path === '/' ? '/index.html' : req.path;
  const ehPagina = caminho.endsWith('.html');
  if (!ehPagina || caminho === '/login.html') return next();
  if (!usuarioDaRequisicao(req)) return res.redirect('/login.html');
  next();
}

module.exports = { COOKIE_SESSAO, exigirAutenticacaoApi, exigirAutenticacaoPagina, usuarioDaRequisicao };
