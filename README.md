# Trading API

![Node](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Express](https://img.shields.io/badge/Express.js-API-black)
![Redis](https://img.shields.io/badge/Cache-Redis-red)
![Swagger](https://img.shields.io/badge/Docs-Swagger-brightgreen)
![License](https://img.shields.io/badge/License-MIT-lightgrey)


## ⚡ Visão geral

Um backend de API de **negociação** de alto desempenho, construído com Node.js, Express e TypeScript, que integra dados financeiros em tempo real do Yahoo Finance (RapidAPI).

Este projeto simula um **backend de mecanismo de negociação fintech moderno**, semelhante a plataformas como Binance, TradingView e terminais Bloomberg.


## Destaques

- Cotações de ações em tempo real
- Cotações de múltiplos ativos
- Principais movimentações do mercado (Maiores ganhadores/perdedores)
- Análises técnicas
- Pontuações de sustentabilidade ESG
- Cadeia de opções (Calls e Puts)
- Dados históricos de OHLCV
- Cache Redis para alto desempenho
- Documentação da API Swagger



## Arquitetura

- Controladores → tratamento de requisições
- Serviços → integração de APIs externas
- Rotas → organização de endpoints
- Redis → camada de cache
- Swagger → documentação da API


## Tech Stack

- Node.js
- Express
- TypeScript
- Axios
- Redis
- Swagger / OpenAPI
- Yahoo Finance API (RapidAPI)



## API Endpoints

### Price
    GET /price/:symbol
### Market
    GET /market/multi-quote
    GET /market/gainers
    GET /market/losers

### Analysis
    GET /analysis/technical/:symbol

### ESG
    GET /esg/:symbol

### Options
    GET /historic/:symbol

## Documentação

Swagger disponível em:
    /api-docs


## ⚡ Performance

- O cache do Redis reduz as chamadas à API
- Respostas de baixa latência
- Otimizado para painéis de controle em tempo real


## Propósito

Este projeto foi desenvolvido para fins **educacionais e de portfólio**, simulando um sistema de back-end de fintech do mundo real.


## Author

Construido por Adolfo Cabeia