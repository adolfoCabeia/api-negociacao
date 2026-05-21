import { Router } from "express";
import { fetchHistoric } from "../controllers/historic.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Historic
 *   description: Dados históricos de preço e volume (OHLCV) de ativos financeiros
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     TradingPeriodSlot:
 *       type: object
 *       description: Janela de horário de um período de negociação (pré, regular ou pós-mercado)
 *       properties:
 *         timezone:
 *           type: string
 *           description: Sigla do fuso horário da bolsa
 *           example: "EDT"
 *         start:
 *           type: integer
 *           format: int64
 *           description: Início do período em Unix timestamp (segundos)
 *           example: 1779370200
 *         end:
 *           type: integer
 *           format: int64
 *           description: Fim do período em Unix timestamp (segundos)
 *           example: 1779393600
 *         gmtoffset:
 *           type: integer
 *           description: Deslocamento em segundos em relação ao GMT (negativo = atrás do GMT)
 *           example: -14400
 *
 *     CurrentTradingPeriod:
 *       type: object
 *       description: Horários dos três períodos de negociação do dia atual
 *       properties:
 *         pre:
 *           $ref: '#/components/schemas/TradingPeriodSlot'
 *           description: Período pré-mercado (pre-market)
 *         regular:
 *           $ref: '#/components/schemas/TradingPeriodSlot'
 *           description: Período regular de negociação
 *         post:
 *           $ref: '#/components/schemas/TradingPeriodSlot'
 *           description: Período pós-mercado (after-hours)
 *
 *     HistoricMeta:
 *       type: object
 *       description: Metadados do ativo e da consulta histórica
 *       properties:
 *         currency:
 *           type: string
 *           description: Moeda de cotação do ativo
 *           example: "USD"
 *         symbol:
 *           type: string
 *           description: Ticker do ativo em maiúsculas
 *           example: "MSFT"
 *         exchangeName:
 *           type: string
 *           description: Código interno da bolsa
 *           example: "NMS"
 *         fullExchangeName:
 *           type: string
 *           description: Nome completo da bolsa de valores
 *           example: "NasdaqGS"
 *         instrumentType:
 *           type: string
 *           enum: [EQUITY, ETF, MUTUALFUND, FUTURE, FOREX, CRYPTOCURRENCY, INDEX]
 *           description: Tipo do instrumento financeiro
 *           example: "EQUITY"
 *         firstTradeDate:
 *           type: integer
 *           format: int64
 *           description: Data do primeiro pregão do ativo em Unix timestamp (segundos)
 *           example: 511108200
 *         regularMarketTime:
 *           type: integer
 *           format: int64
 *           description: Timestamp da última cotação do mercado regular (segundos)
 *           example: 1779373138
 *         hasPrePostMarketData:
 *           type: boolean
 *           description: Indica se o ativo possui dados de pré e pós-mercado disponíveis
 *           example: true
 *         gmtoffset:
 *           type: integer
 *           description: Deslocamento da bolsa em relação ao GMT (em segundos)
 *           example: -14400
 *         timezone:
 *           type: string
 *           description: Sigla do fuso horário da bolsa
 *           example: "EDT"
 *         exchangeTimezoneName:
 *           type: string
 *           description: Nome completo do fuso horário da bolsa (em português)
 *           example: "América/Novo_Iorque"
 *         regularMarketPrice:
 *           type: number
 *           format: float
 *           description: Preço atual do mercado regular (em USD)
 *           example: 416.375
 *         fiftyTwoWeekHigh:
 *           type: number
 *           format: float
 *           description: Máxima das últimas 52 semanas (em USD)
 *           example: 555.45
 *         fiftyTwoWeekLow:
 *           type: number
 *           format: float
 *           description: Mínima das últimas 52 semanas (em USD)
 *           example: 356.28
 *         regularMarketDayHigh:
 *           type: number
 *           format: float
 *           description: Máxima do dia no mercado regular (em USD)
 *           example: 426.34
 *         regularMarketDayLow:
 *           type: number
 *           format: float
 *           description: Mínima do dia no mercado regular (em USD)
 *           example: 416.14
 *         regularMarketVolume:
 *           type: integer
 *           format: int64
 *           description: Volume negociado no mercado regular no dia atual
 *           example: 8406829
 *         longName:
 *           type: string
 *           description: Nome completo da empresa
 *           example: "Microsoft Corporation"
 *         shortName:
 *           type: string
 *           description: Nome abreviado da empresa
 *           example: "Microsoft Corporation"
 *         chartPreviousClose:
 *           type: number
 *           format: float
 *           description: Preço de fechamento do pregão anterior (base do gráfico)
 *           example: 407.78
 *         priceHint:
 *           type: integer
 *           description: Número de casas decimais sugerido para exibição do preço
 *           example: 2
 *         currentTradingPeriod:
 *           $ref: '#/components/schemas/CurrentTradingPeriod'
 *         dataGranularity:
 *           type: string
 *           description: Granularidade dos candles retornados
 *           enum: ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"]
 *           example: "1d"
 *         range:
 *           type: string
 *           description: Período total dos dados retornados
 *           enum: ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]
 *           example: "15d"
 *         validRanges:
 *           type: array
 *           description: Lista de todos os períodos válidos para este ativo
 *           items:
 *             type: string
 *           example: ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]
 *
 *     OHLCVQuote:
 *       type: object
 *       description: >
 *         Arrays paralelos de dados OHLCV (Open, High, Low, Close, Volume).
 *         Cada índice corresponde ao mesmo índice no array `timestamp` da raiz.
 *         Todos os valores de preço estão em USD com precisão float64.
 *       properties:
 *         open:
 *           type: array
 *           description: Preços de abertura de cada candle (em USD)
 *           items:
 *             type: number
 *             format: float
 *           example: [412.79, 411.54, 415.32]
 *         high:
 *           type: array
 *           description: Preços máximos de cada candle (em USD)
 *           items:
 *             type: number
 *             format: float
 *           example: [417.10, 420.77, 416.77]
 *         low:
 *           type: array
 *           description: Preços mínimos de cada candle (em USD)
 *           items:
 *             type: number
 *             format: float
 *           example: [410.44, 410.79, 408.79]
 *         close:
 *           type: array
 *           description: Preços de fechamento de cada candle (em USD)
 *           items:
 *             type: number
 *             format: float
 *           example: [414.44, 413.61, 411.38]
 *         volume:
 *           type: array
 *           description: Volume de contratos/ações negociados em cada candle
 *           items:
 *             type: integer
 *             format: int64
 *           example: [31372400, 28066500, 25700900]
 *
 *     AdjClose:
 *       type: object
 *       description: >
 *         Preços de fechamento ajustados por dividendos e desdobramentos (split).
 *         Índices paralelos ao array `timestamp`.
 *       properties:
 *         adjclose:
 *           type: array
 *           description: Fechamentos ajustados de cada candle (em USD)
 *           items:
 *             type: number
 *             format: float
 *           example: [414.44, 413.61, 411.38]
 *
 *     HistoricIndicators:
 *       type: object
 *       description: Contêiner dos arrays de dados OHLCV e fechamento ajustado
 *       properties:
 *         quote:
 *           type: array
 *           description: Array com um único objeto contendo os dados OHLCV brutos
 *           items:
 *             $ref: '#/components/schemas/OHLCVQuote'
 *           minItems: 1
 *           maxItems: 1
 *         adjclose:
 *           type: array
 *           description: Array com um único objeto contendo os fechamentos ajustados
 *           items:
 *             $ref: '#/components/schemas/AdjClose'
 *           minItems: 1
 *           maxItems: 1
 *
 *     HistoricResult:
 *       type: object
 *       description: Resultado completo de uma série histórica de um ativo
 *       properties:
 *         meta:
 *           $ref: '#/components/schemas/HistoricMeta'
 *         timestamp:
 *           type: array
 *           description: >
 *             Timestamps de abertura de cada candle em Unix (segundos).
 *             Use este array como eixo X para construir gráficos — cada índice
 *             corresponde ao mesmo índice nos arrays OHLCV dentro de `indicators`.
 *           items:
 *             type: integer
 *             format: int64
 *           example: [1777642200, 1777901400, 1777987800]
 *         indicators:
 *           $ref: '#/components/schemas/HistoricIndicators'
 *
 *     HistoricChart:
 *       type: object
 *       description: Envelope do resultado do gráfico histórico
 *       properties:
 *         result:
 *           type: array
 *           description: Array com o resultado da consulta (sempre 1 item por símbolo)
 *           items:
 *             $ref: '#/components/schemas/HistoricResult'
 *           minItems: 1
 *           maxItems: 1
 *         error:
 *           description: Erro retornado pela API do Yahoo Finance (null em caso de sucesso)
 *           nullable: true
 *           example: null
 *
 *     HistoricResponse:
 *       type: object
 *       description: Resposta completa do endpoint de dados históricos
 *       properties:
 *         source:
 *           type: string
 *           enum: [api, cache]
 *           description: Origem dos dados — api (Yahoo Finance) ou cache (Redis)
 *           example: "api"
 *         data:
 *           type: object
 *           properties:
 *             chart:
 *               $ref: '#/components/schemas/HistoricChart'
 */

/**
 * @swagger
 * /historic/{symbol}:
 *   get:
 *     tags: [Historic]
 *     summary: Série histórica OHLCV de um ativo
 *     description: >
 *       Retorna a série histórica de candles OHLCV (Abertura, Máxima, Mínima, Fechamento
 *       e Volume) de um ativo financeiro, com fechamento ajustado por dividendos e splits.
 *
 *
 *       A resposta inclui também metadados do ativo (nome, bolsa, moeda, máximas/mínimas
 *       de 52 semanas, horários de pregão) e os timestamps de cada candle como eixo X.
 *
 *
 *       **Estrutura dos dados:** todos os arrays dentro de `indicators.quote[0]` e
 *       `indicators.adjclose[0].adjclose` são paralelos ao array `timestamp` da raiz —
 *       o índice `i` de cada array corresponde ao mesmo candle.
 *
 *
 *       Os dados são armazenados em cache por **1 hora (3600 segundos)**.
 *       Campos textuais são **automaticamente traduzidos para português**.
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: "Ticker do ativo (ex: AAPL, MSFT, PETR4.SA)"
 *         examples:
 *           microsoft:
 *             summary: Microsoft Corp.
 *             value: MSFT
 *           apple:
 *             summary: Apple Inc.
 *             value: AAPL
 *           petrobras:
 *             summary: Petrobras (B3)
 *             value: PETR4.SA
 *       - in: query
 *         name: interval
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"]
 *           default: "1d"
 *         description: >
 *           Granularidade de cada candle. Intervalos intraday (1m–90m) só estão
 *           disponíveis para períodos de até 60 dias.
 *         examples:
 *           diario:
 *             summary: Diário
 *             value: "1d"
 *           semanal:
 *             summary: Semanal
 *             value: "1wk"
 *           mensal:
 *             summary: Mensal
 *             value: "1mo"
 *           intraday_1h:
 *             summary: Intraday 1 hora
 *             value: "1h"
 *       - in: query
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]
 *           default: "1mo"
 *         description: Janela de tempo total dos dados retornados
 *         examples:
 *           quinze_dias:
 *             summary: 15 dias
 *             value: "15d"
 *           tres_meses:
 *             summary: 3 meses
 *             value: "3mo"
 *           um_ano:
 *             summary: 1 ano
 *             value: "1y"
 *           maximo:
 *             summary: Máximo histórico
 *             value: "max"
 *     responses:
 *       200:
 *         description: Série histórica retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoricResponse'
 *             example:
 *               source: "api"
 *               data:
 *                 chart:
 *                   result:
 *                     - meta:
 *                         currency: "USD"
 *                         symbol: "MSFT"
 *                         exchangeName: "NMS"
 *                         fullExchangeName: "NasdaqGS"
 *                         instrumentType: "EQUITY"
 *                         regularMarketPrice: 416.375
 *                         fiftyTwoWeekHigh: 555.45
 *                         fiftyTwoWeekLow: 356.28
 *                         regularMarketDayHigh: 426.34
 *                         regularMarketDayLow: 416.14
 *                         regularMarketVolume: 8406829
 *                         longName: "Microsoft Corporation"
 *                         chartPreviousClose: 407.78
 *                         dataGranularity: "1d"
 *                         range: "15d"
 *                       timestamp: [1777642200, 1777901400, 1777987800]
 *                       indicators:
 *                         quote:
 *                           - open: [412.79, 411.54, 415.32]
 *                             high: [417.10, 420.77, 416.77]
 *                             low: [410.44, 410.79, 408.79]
 *                             close: [414.44, 413.61, 411.38]
 *                             volume: [31372400, 28066500, 25700900]
 *                         adjclose:
 *                           - adjclose: [414.44, 413.61, 411.38]
 *                   error: null
 *       400:
 *         description: Parâmetros inválidos (symbol, interval ou period incorretos)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Parâmetros inválidos"
 *       404:
 *         description: Ativo não encontrado no Yahoo Finance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Símbolo não encontrado"
 *       429:
 *         description: Limite de requisições da API externa atingido (RapidAPI rate limit)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Rate limit excedido. Tente novamente em instantes."
 *       500:
 *         description: Erro interno do servidor ou falha na API externa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao buscar dados históricos"
 */
router.get("/:symbol", fetchHistoric);

export default router;