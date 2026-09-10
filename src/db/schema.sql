-- ValidaFIFO - Script de criacao das tabelas relacionais
-- Referencia: Passo 1 (Issue #1) e Modelo de Dominio / Diagrama de Classes do projeto

CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nota_fiscal (
    id SERIAL PRIMARY KEY,
    chave_acesso VARCHAR(44) NOT NULL UNIQUE,
    data_emissao DATE,
    importada_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produto (
    id SERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lote (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produto(id),
    nota_fiscal_id INTEGER REFERENCES nota_fiscal(id),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    data_validade DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'baixado')),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lote_status_validade ON lote (status, data_validade);
CREATE INDEX IF NOT EXISTS idx_lote_produto ON lote (produto_id);
