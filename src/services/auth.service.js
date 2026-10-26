const crypto = require('crypto');
const pool = require('../config/db');

const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000;

let segredo = process.env.AUTH_SECRET;
if (!segredo) {
  // Sem AUTH_SECRET as sessoes continuam funcionando, mas sao invalidadas a cada reinicio do servidor.
  segredo = crypto.randomBytes(32).toString('hex');
  console.warn('AUTH_SECRET nao definido: usando um segredo temporario (as sessoes expiram ao reiniciar o servidor).');
}

function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verificarSenha(senha, armazenado) {
  const partes = String(armazenado || '').split('$');
  if (partes.length !== 3 || partes[0] !== 'scrypt') return false;
  const esperado = Buffer.from(partes[2], 'hex');
  const calculado = crypto.scryptSync(String(senha), partes[1], esperado.length);
  return crypto.timingSafeEqual(esperado, calculado);
}

function assinar(conteudo) {
  return crypto.createHmac('sha256', segredo).update(conteudo).digest('base64url');
}

function gerarToken(usuario, agora = Date.now()) {
  const payload = { id: usuario.id, nome: usuario.nome, email: usuario.email, exp: agora + DURACAO_SESSAO_MS };
  const corpo = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${corpo}.${assinar(corpo)}`;
}

function validarToken(token, agora = Date.now()) {
  if (!token || typeof token !== 'string') return null;
  const [corpo, assinatura] = token.split('.');
  if (!corpo || !assinatura) return null;

  const esperada = Buffer.from(assinar(corpo));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length || !crypto.timingSafeEqual(esperada, recebida)) return null;

  try {
    const payload = JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < agora) return null;
    return { id: payload.id, nome: payload.nome, email: payload.email };
  } catch {
    return null;
  }
}

/**
 * Valida as credenciais no banco de dados.
 * Referencia: Passo 7 (Issue #7) e UC01 - Autenticar-se no sistema.
 */
async function autenticar(email, senha) {
  const { rows } = await pool.query(
    'SELECT id, nome, email, senha FROM usuario WHERE LOWER(email) = LOWER($1)',
    [String(email).trim()]
  );
  const usuario = rows[0];
  if (!usuario || !verificarSenha(senha, usuario.senha)) return null;
  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

async function salvarUsuario(client, { nome, email, senha }) {
  const { rows } = await client.query(
    `INSERT INTO usuario (nome, email, senha)
     VALUES ($1, LOWER($2), $3)
     ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome, senha = EXCLUDED.senha
     RETURNING id, (xmax = 0) AS criado`,
    [nome, String(email).trim(), hashSenha(senha)]
  );
  return rows[0];
}

module.exports = {
  DURACAO_SESSAO_MS,
  hashSenha,
  verificarSenha,
  gerarToken,
  validarToken,
  autenticar,
  salvarUsuario,
};
