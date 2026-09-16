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

## Passo 2 — Módulo de leitura do XML (Issue #2)

Endpoint `POST /api/notas-fiscais/importar`: recebe o arquivo XML da NF-e (campo `arquivoXml`, multipart) e retorna a chave de acesso, a data de emissão e os itens identificados (código EAN, descrição e quantidade), sem gravar nada no banco ainda.

## Passo 3 — Tela de cadastro e vínculo de validades (Issue #3)

Acesse `http://localhost:3000/importar.html` para:
1. Selecionar o XML da NF-e e visualizar os itens extraídos.
2. Informar a data de validade de cada produto.
3. Salvar o cadastro (`POST /api/notas-fiscais/confirmar`), que verifica se o produto já existe pelo código EAN (senão, cadastra um novo) e grava o lote vinculado à nota fiscal.

## Passo 4 — Dashboard FIFO e alertas de cor (Issue #4)

Acesse `http://localhost:3000` (redireciona para `dashboard.html`) para ver:
- Os cartões-resumo com a quantidade de produtos monitorados, vencidos e a vencer em até 7, 15 e 30 dias.
- A tabela de produtos ativos, obtida via `GET /api/dashboard`, ordenada por `data_validade ASC` (lógica FIFO), com destaque de cor por faixa de vencimento: vermelho (vencido), laranja (até 7 dias), amarelo (até 15 dias) e verde (dentro do prazo).

## Passo 5 — Botão de baixa (Issue #5)

Na tabela do Dashboard FIFO, cada produto tem um botão "Dar baixa" que chama `PATCH /api/lotes/:id/baixa`, atualizando o status do lote para `baixado` no banco de dados e removendo-o imediatamente da lista de produtos ativos.

## Estrutura de pastas (até o momento)

```
server.js                  # ponto de entrada (health check, arquivos estáticos, rotas de nota fiscal, dashboard e lote)
src/
  config/db.js             # conexão com o PostgreSQL (pg Pool)
  db/schema.sql            # script de criação das 4 tabelas
  db/initDb.js             # executa o schema.sql no banco configurado
  middleware/upload.js     # upload do arquivo XML (multer)
  services/
    xmlParser.service.js   # leitura e extração dos dados do XML da NF-e
    notaFiscal.service.js  # gravação de produto/lote vinculados à nota fiscal
    dashboard.service.js   # consulta FIFO e classificação por faixa/cor de vencimento
    lote.service.js        # registro de baixa de um lote
  routes/
    notaFiscal.routes.js   # POST /importar e POST /confirmar
    dashboard.routes.js    # GET /api/dashboard
    lote.routes.js         # PATCH /api/lotes/:id/baixa
public/
  index.html                                      # redireciona para dashboard.html
  dashboard.html, js/dashboard.js                  # dashboard FIFO com cartões, tabela colorida e botão de baixa
  importar.html, js/importar.js, css/style.css     # tela de importação e cadastro de validade
  js/api.js                                        # wrapper de chamadas à API
```
