const test = require('node:test');
const assert = require('node:assert/strict');
const { hashSenha, verificarSenha, gerarToken, validarToken, DURACAO_SESSAO_MS } = require('../src/services/auth.service');

const usuario = { id: 1, nome: 'Vania Marinelli', email: 'vania@mercadocentral.com.br' };

test('a senha e armazenada com hash e salt, nunca em texto puro', () => {
  const armazenado = hashSenha('senhaSegura123');
  assert.match(armazenado, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.ok(!armazenado.includes('senhaSegura123'));
  assert.notEqual(hashSenha('senhaSegura123'), armazenado, 'salts diferentes geram hashes diferentes');
});

test('verificarSenha aceita a senha correta e recusa a incorreta', () => {
  const armazenado = hashSenha('senhaSegura123');
  assert.equal(verificarSenha('senhaSegura123', armazenado), true);
  assert.equal(verificarSenha('senhaErrada', armazenado), false);
  assert.equal(verificarSenha('qualquer', 'valor-invalido'), false);
});

test('token valido devolve os dados do usuario', () => {
  const token = gerarToken(usuario);
  assert.deepEqual(validarToken(token), usuario);
});

test('token adulterado e recusado', () => {
  const token = gerarToken(usuario);
  const [corpo, assinatura] = token.split('.');
  const corpoFalso = Buffer.from(JSON.stringify({ ...usuario, id: 99, exp: Date.now() + 10000 })).toString('base64url');
  assert.equal(validarToken(`${corpoFalso}.${assinatura}`), null);
  assert.equal(validarToken(`${corpo}.assinaturaInvalida`), null);
  assert.equal(validarToken(''), null);
  assert.equal(validarToken(null), null);
});

test('token expira apos a duracao da sessao', () => {
  const agora = Date.now();
  const token = gerarToken(usuario, agora);
  assert.deepEqual(validarToken(token, agora + DURACAO_SESSAO_MS - 1000), usuario);
  assert.equal(validarToken(token, agora + DURACAO_SESSAO_MS + 1000), null);
});
