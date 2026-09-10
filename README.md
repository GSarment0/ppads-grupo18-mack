# ppads-grupo18-mack — ValidaFIFO

Repositório do aplicativo desenvolvido para a disciplina de Projeto Prático Profissional do curso de Análise e Desenvolvimento de Sistemas (ADS).

**Integrantes:**
- Gabriel Oliveira Sarmento - 10724499
- Giuliana Dias Guimarães - 10423527
- Vânia Gomes Marinelli - 10721502
- Yasmin Keller Santos da Silva - 10727922

## Sobre o projeto

O **ValidaFIFO** é um sistema de apoio à gestão de validade de produtos para pequeno e médio varejo. Ele lê o XML da Nota Fiscal Eletrônica (NF-e) para identificar automaticamente os itens e quantidades adquiridas, permite o cadastro manual da data de validade de cada produto e mantém um dashboard organizado pela lógica FIFO (primeiro que vence, primeiro a sair).

Documento de especificação completo: `ValidaFIFO_Documento_de_Projeto-1.pdf` (pasta do projeto).

O desenvolvimento desta 1ª iteração segue as Issues #1 a #6 do repositório, implementadas em etapas.

## Arquitetura

- **Frontend**: HTML/CSS/JavaScript puro (sem build step), servido como arquivos estáticos.
- **Backend**: Node.js/Express, expondo endpoints REST/JSON.
- **Banco de dados**: PostgreSQL.

Frontend e API rodam no mesmo servidor de aplicação (`server.js`).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior (inclui o `npm`).
- [PostgreSQL](https://www.postgresql.org/) 13 ou superior, rodando localmente ou em um serviço na nuvem.

## Passo 1 — Banco de dados e conexão (Issue #1)

```bash
# 1. Instalar as dependências
npm install

# 2. Copiar o arquivo de variáveis de ambiente e ajustar os dados de conexão do banco
copy .env.example .env

# 3. Criar o banco de dados vazio no PostgreSQL (ex.: via psql ou pgAdmin)
#    createdb validafifo

# 4. Rodar o script de criação das tabelas (usuario, nota_fiscal, produto, lote)
npm run db:init

# 5. Iniciar a aplicação
npm start
```

Para verificar se a API e o banco estão respondendo:

```bash
curl http://localhost:3000/api/health
```

## Estrutura de pastas (até o momento)

```
server.js                  # ponto de entrada (health check + arquivos estáticos)
src/
  config/db.js             # conexão com o PostgreSQL (pg Pool)
  db/schema.sql            # script de criação das 4 tabelas
  db/initDb.js             # executa o schema.sql no banco configurado
```
