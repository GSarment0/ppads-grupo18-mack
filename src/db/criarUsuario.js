const pool = require('../config/db');
const { salvarUsuario } = require('../services/auth.service');

// Uso: npm run user:create -- --nome "Vania Marinelli" --email vania@mercadocentral.com.br --senha "minhaSenha"
// Se o e-mail ja existir, o nome e a senha sao atualizados.
function lerArgumentos(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

function validar({ nome, email, senha }) {
  if (!nome || !email || !senha) return 'Informe --nome, --email e --senha.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'E-mail invalido.';
  if (String(senha).length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
  return null;
}

async function main() {
  const dados = lerArgumentos(process.argv.slice(2));
  const erro = validar(dados);
  if (erro) {
    console.error(erro);
    process.exitCode = 1;
    return;
  }
  const client = await pool.connect();
  try {
    const resultado = await salvarUsuario(client, dados);
    console.log(`Usuario ${dados.email} ${resultado.criado ? 'criado' : 'atualizado'} com sucesso.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Falha ao salvar o usuario:', err.message);
  process.exitCode = 1;
});
