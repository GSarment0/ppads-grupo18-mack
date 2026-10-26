# ppads-grupo18-mack — ValidaFIFO

Repositório do aplicativo desenvolvido para a disciplina de Projeto Prático Profissional do curso de Análise e Desenvolvimento de Sistemas (ADS) — Universidade Presbiteriana Mackenzie.

**Integrantes:**
- Gabriel Oliveira Sarmento - 10724499
- Giuliana Dias Guimarães - 10423527
- Vânia Gomes Marinelli - 10721502
- Yasmin Keller Santos da Silva - 10727922

**Aplicação publicada:** https://ppads-grupo18-mack.onrender.com
_(plano gratuito do Render: após um tempo sem uso o serviço "dorme" e a primeira requisição pode levar de 30 a 50 segundos)._

> **Acesso:** desde a Iteração 2 a aplicação exige login (e-mail e senha). Os usuários são cadastrados pelo responsável técnico (comando `npm run user:create` ou variáveis `ADMIN_*`, descritos abaixo). Na instância publicada no Render nenhum usuário foi cadastrado; por isso, para testar todas as funcionalidades, siga o passo a passo "Como executar a aplicação no seu computador". Para apenas demonstrar a aplicação sem cadastrar usuário, coloque `AUTH_DESATIVADA=true` no arquivo `.env` (ou nas variáveis de ambiente do Render): o login deixa de ser exigido.

## Sobre o projeto

O **ValidaFIFO** é um sistema de apoio à gestão de validade de produtos para o pequeno e médio varejo. Ele lê o XML da Nota Fiscal Eletrônica (NF-e) para identificar automaticamente os itens e as quantidades adquiridas, permite o cadastro manual da data de validade de cada produto, mantém um dashboard organizado pela lógica FIFO (primeiro que vence, primeiro a sair) e gera relatórios de produtos vencidos e a vencer. O acesso é restrito a usuários cadastrados.

## Versões

| Versão | Tag / branch | Conteúdo |
|---|---|---|
| Iteração 1 | tag `v1` | Issues #1 a #6: banco de dados, leitura do XML da NF-e, cadastro de validades, dashboard FIFO com alertas de cor, baixa de produtos, testes e publicação. |
| Iteração 2 | tag `v2` (desenvolvida na branch `iteracao2`) | Issues #7 e #8: autenticação de usuário (login) e geração de relatórios de vencimentos em PDF. |

## Tecnologias

- **Frontend:** HTML, CSS e JavaScript puro (sem etapa de build), servidos como arquivos estáticos.
- **Backend:** Node.js com Express (API REST/JSON).
- **Banco de dados:** PostgreSQL.
- **Bibliotecas principais:** `pg` (acesso ao PostgreSQL), `fast-xml-parser` (leitura do XML da NF-e), `multer` (upload do arquivo), `pdfkit` (geração do relatório em PDF), `dotenv` (variáveis de ambiente).

Frontend e API rodam no mesmo processo Node (`server.js`).

---

## Como executar a aplicação no seu computador

O passo a passo abaixo foi escrito para quem nunca rodou o projeto. Os comandos funcionam no Windows (PowerShell ou Prompt de Comando), no Linux e no macOS; quando houver diferença, as duas formas estão indicadas.

### 1. Instale os pré-requisitos

| Programa | Versão | Onde obter |
|---|---|---|
| Node.js (já inclui o `npm`) | 18 ou superior (recomendado: a versão LTS mais recente) | https://nodejs.org |
| PostgreSQL | 13 ou superior | https://www.postgresql.org/download |
| Git | qualquer versão recente | https://git-scm.com |

Durante a instalação do PostgreSQL, anote a **senha do usuário `postgres`** que você definir: ela será usada no passo 5.

Para conferir se tudo foi instalado, abra um terminal e execute:

```bash
node -v
npm -v
git --version
psql --version
```

Cada comando deve mostrar um número de versão. No Windows, se o `psql` não for reconhecido, use o **pgAdmin** (instalado junto com o PostgreSQL) no passo 4, ou adicione `C:\Program Files\PostgreSQL\<versão>\bin` ao PATH.

### 2. Baixe o código-fonte

```bash
git clone https://github.com/GSarment0/ppads-grupo18-mack.git
cd ppads-grupo18-mack
```

Para usar exatamente a versão entregue na Iteração 2, execute também `git checkout v2`.

### 3. Instale as dependências do projeto

```bash
npm install
```

Esse comando cria a pasta `node_modules` com as bibliotecas listadas no `package.json`, nas versões fixadas pelo `package-lock.json`.

### 4. Crie o banco de dados

Com o PostgreSQL em execução, crie um banco vazio chamado `validafifo`:

```bash
psql -U postgres -c "CREATE DATABASE validafifo;"
```

O `psql` vai pedir a senha do usuário `postgres`. Se preferir a interface gráfica: no **pgAdmin**, clique com o botão direito em *Databases* → *Create* → *Database...*, informe o nome `validafifo` e salve.

### 5. Configure as variáveis de ambiente

Copie o arquivo de exemplo para `.env`:

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Abra o `.env` em um editor de texto e ajuste:

- `DB_PASSWORD`: a senha do usuário `postgres` definida na instalação (ajuste também `DB_USER`, `DB_HOST` e `DB_PORT` se o seu PostgreSQL usar valores diferentes do padrão).
- `AUTH_SECRET`: uma chave aleatória usada para assinar as sessões de login. Gere uma com o comando abaixo e cole o resultado:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

O arquivo `.env` contém senhas e **não deve ser enviado ao GitHub** (ele já está no `.gitignore`).

### 6. Crie as tabelas

```bash
npm run db:init
```

Saída esperada: `Banco de dados ValidaFIFO inicializado com sucesso (usuario, nota_fiscal, produto, lote).` O comando pode ser executado mais de uma vez sem apagar dados.

### 7. Cadastre um usuário para fazer login

Como o acesso ao sistema é restrito, crie pelo menos um usuário (troque os valores de exemplo; a senha deve ter no mínimo 6 caracteres):

```bash
npm run user:create -- --nome "Vania Marinelli" --email vania@mercadocentral.com.br --senha "escolha-uma-senha"
```

Saída esperada: `Usuario vania@mercadocentral.com.br criado com sucesso.` Se o e-mail já existir, o nome e a senha são atualizados.

### 8. Inicie a aplicação

```bash
npm start
```

Saída esperada: `ValidaFIFO API + Web App rodando em http://localhost:3000`. Mantenha esse terminal aberto enquanto usar o sistema; para encerrar, pressione `Ctrl + C`.

Durante o desenvolvimento, `npm run dev` reinicia o servidor automaticamente a cada alteração no código.

### 9. Acesse no navegador

Abra http://localhost:3000. Você será levado à tela de login; entre com o e-mail e a senha cadastrados no passo 7.

Para um primeiro teste, use a nota fiscal de exemplo que acompanha o projeto: na tela **Importar XML**, selecione o arquivo `tests/fixtures/nfe-exemplo.xml`, informe as datas de validade e salve. Os produtos passam a aparecer no **Dashboard FIFO** e podem ser consultados em **Relatórios**.

### 10. Execute os testes automatizados (opcional)

```bash
npm test
```

Executa os testes do leitor de XML, da autenticação (hash de senha e sessão) e da validação do relatório. Não é preciso ter o banco de dados em execução para esses testes.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | não (padrão `3000`) | Porta HTTP da aplicação. |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | sim, se não usar `DATABASE_URL` | Dados de conexão com o PostgreSQL. |
| `DATABASE_URL` | não | URL completa de conexão (ex.: a do Render). Se definida, tem prioridade sobre as variáveis `DB_*`. |
| `DB_SSL` | não (padrão `false`) | Use `true` quando o banco exigir conexão segura (bancos na nuvem). |
| `AUTH_SECRET` | recomendada | Chave para assinar as sessões de login. Sem ela, o servidor gera uma temporária e os usuários são deslogados a cada reinício. |
| `ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | não | Se definidas, o `npm run db:init` cria (ou atualiza) esse usuário. Útil em hospedagens sem acesso ao terminal. |
| `AUTH_DESATIVADA` | não (padrão desligada) | Apenas para demonstração: com `true`, o login não é exigido e não é preciso cadastrar usuário. Não use em ambiente real. |

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm start` | Inicia a aplicação. |
| `npm run dev` | Inicia a aplicação e reinicia a cada alteração no código. |
| `npm run db:init` | Cria as tabelas (e o usuário inicial, se as variáveis `ADMIN_*` estiverem definidas). |
| `npm run user:create -- --nome "..." --email ... --senha "..."` | Cria ou atualiza um usuário. |
| `npm test` | Executa os testes automatizados. |

## Telas

| Tela | Endereço | Descrição |
|---|---|---|
| Login | `/login.html` | Acesso com e-mail e senha. |
| Dashboard FIFO | `/dashboard.html` | Cartões-resumo de vencimentos e lista de produtos ativos em ordem FIFO, com cores por faixa de vencimento e botão "Dar baixa". |
| Importar XML | `/importar.html` | Envio do XML da NF-e e cadastro da validade de cada item. |
| Relatórios | `/relatorios.html` | Prévia dos produtos vencidos e a vencer em um período e exportação em PDF. |

## API REST

Todas as rotas, exceto `/api/health` e `/api/auth/login`, exigem uma sessão válida (cookie gerado no login).

| Método e rota | Descrição |
|---|---|
| `GET /api/health` | Verifica se a API e o banco estão respondendo. |
| `POST /api/auth/login` | Login (`{ "email", "senha" }`). |
| `POST /api/auth/logout` | Encerra a sessão. |
| `GET /api/auth/me` | Usuário logado. |
| `POST /api/notas-fiscais/importar` | Lê o XML da NF-e enviado no campo `arquivoXml` e devolve os itens. |
| `POST /api/notas-fiscais/confirmar` | Grava produtos e lotes com as datas de validade. |
| `GET /api/dashboard` | Lotes ativos em ordem FIFO e resumo por faixa de vencimento. |
| `PATCH /api/lotes/:id/baixa` | Registra a baixa de um lote. |
| `GET /api/relatorios?inicio=AAAA-MM-DD&fim=AAAA-MM-DD&situacao=todos` | Prévia do relatório (`situacao`: `todos`, `vencidos` ou `a_vencer`). |
| `GET /api/relatorios/pdf?inicio=...&fim=...&situacao=...` | Relatório em PDF para download. |

## Problemas comuns

| Sintoma | Causa provável e solução |
|---|---|
| `ECONNREFUSED` ao rodar `npm run db:init` ou `npm start` | O PostgreSQL não está em execução, ou `DB_HOST`/`DB_PORT` estão errados. Inicie o serviço do PostgreSQL e confira o `.env`. |
| `password authentication failed for user "postgres"` | `DB_PASSWORD` no `.env` não confere com a senha do PostgreSQL. |
| `database "validafifo" does not exist` | O passo 4 não foi executado. Crie o banco e rode `npm run db:init` de novo. |
| `EADDRINUSE` ao iniciar | A porta 3000 já está em uso. Feche o outro programa ou defina outra porta no `.env` (ex.: `PORT=3001`). |
| "Credenciais invalidas" no login | O usuário não foi criado ou a senha está diferente. Rode o passo 7 novamente (ele atualiza a senha). |
| É preciso fazer login de novo após reiniciar o servidor | `AUTH_SECRET` não foi definido no `.env`. |
| Erro de SSL ao conectar a um banco na nuvem | Defina `DB_SSL=true`. |

## Estrutura de pastas

```
server.js                    # ponto de entrada (API + arquivos estáticos + proteção de acesso)
src/
  config/db.js               # conexão com o PostgreSQL
  db/schema.sql              # criação das tabelas usuario, nota_fiscal, produto e lote
  db/initDb.js               # executa o schema (npm run db:init)
  db/criarUsuario.js         # cadastro de usuário (npm run user:create)
  middleware/auth.js         # exige login nas páginas e na API
  middleware/upload.js       # upload do arquivo XML
  services/                  # regras de negócio (XML, importação, dashboard, baixa, autenticação, relatórios)
  routes/                    # endpoints REST
public/                      # telas (login, dashboard, importação, relatórios), CSS e JavaScript do navegador
tests/                       # testes automatizados e XMLs de exemplo
```

## Publicação (deploy no Render)

1. Crie um banco PostgreSQL no Render.
2. Crie um *Web Service* apontando para este repositório, com **Build Command** `npm install && npm run db:init` e **Start Command** `npm start`.
3. Em *Environment*, defina `DATABASE_URL` (use a *Internal Database URL* do banco), `DB_SSL=true`, `AUTH_SECRET` (valor aleatório) e, para criar o primeiro usuário, `ADMIN_NOME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.
4. A cada novo deploy, o `db:init` garante as tabelas e o usuário inicial.

## Desenvolvimento por Issue

| Issue | Entrega | Arquivos principais |
|---|---|---|
| #1 | Banco de dados e conexão | `src/db/schema.sql`, `src/db/initDb.js`, `src/config/db.js` |
| #2 | Módulo de leitura do XML | `src/services/xmlParser.service.js`, `src/middleware/upload.js` |
| #3 | Tela de cadastro e vínculo de validades | `public/importar.html`, `public/js/importar.js`, `src/services/notaFiscal.service.js` |
| #4 | Dashboard FIFO e alertas de cor | `src/services/dashboard.service.js`, `public/dashboard.html`, `public/js/dashboard.js` |
| #5 | Botão de baixa | `src/services/lote.service.js`, `src/routes/lote.routes.js` |
| #6 | Testes e publicação | `tests/`, seção de publicação deste README |
| #7 | Autenticação de usuário (login) | `src/services/auth.service.js`, `src/middleware/auth.js`, `src/routes/auth.routes.js`, `public/login.html`, `src/db/criarUsuario.js` |
| #8 | Relatórios de vencimentos | `src/services/relatorio.service.js`, `src/services/relatorioPdf.service.js`, `src/routes/relatorio.routes.js`, `public/relatorios.html` |

Documento de especificação do projeto: `ValidaFIFO_Documento_de_Projeto.pdf` (entregue junto com esta iteração).
