import { Router } from "express";
import { fetchPrice } from "../controllers/price.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Price
 *   description: Cotação em tempo real de ativos financeiros
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     PriceValue:
 *       type: object
 *       description: Valor numérico com representação formatada para exibição
 *       properties:
 *         raw:
 *           type: number
 *           format: float
 *           description: Valor numérico bruto para cálculos
 *           example: 302.42
 *         fmt:
 *           type: string
 *           description: Valor formatado para exibição
 *           example: "302.42"
 *
 *     PriceValueLong:
 *       type: object
 *       description: >
 *         Valor numérico com formatação compacta e longa (usado em volume,
 *         market cap e shares outstanding).
 *       properties:
 *         raw:
 *           type: number
 *           format: float
 *           description: Valor numérico bruto
 *           example: 7379818
 *         fmt:
 *           type: string
 *           description: Formato compacto com sufixo (K, M, B, T)
 *           example: "7.38M"
 *         longFmt:
 *           type: string
 *           description: Valor completo com separadores de milhar
 *           example: "7,379,818"
 *
 *     PriceMarketTime:
 *       type: object
 *       description: Timestamp da última cotação com horário local formatado
 *       properties:
 *         raw:
 *           type: integer
 *           format: int64
 *           description: Timestamp Unix em segundos
 *           example: 1779374377
 *         fmt:
 *           type: string
 *           description: Horário local da bolsa formatado
 *           example: "10:39AM EDT"
 *
 *     PriceData:
 *       type: object
 *       description: >
 *         Cotação completa de um ativo em tempo real com preços,
 *         variações, volume, market cap e informações da bolsa.
 *       properties:
 *         symbol:
 *           type: string
 *           description: Ticker do ativo em maiúsculas
 *           example: "AAPL"
 *         shortName:
 *           type: string
 *           description: Nome abreviado da empresa
 *           example: "Apple Inc."
 *         longName:
 *           type: string
 *           description: Nome completo da empresa
 *           example: "Apple Inc."
 *         currency:
 *           type: string
 *           description: Moeda de cotação
 *           example: "USD"
 *         quoteType:
 *           type: string
 *           enum: [EQUITY, ETF, MUTUALFUND, FUTURE, FOREX, CRYPTOCURRENCY, INDEX]
 *           description: Tipo do instrumento financeiro
 *           example: "EQUITY"
 *         typeDisp:
 *           type: string
 *           description: Tipo do instrumento para exibição
 *           example: "Equity"
 *         language:
 *           type: string
 *           description: Idioma dos dados retornados
 *           example: "en-US"
 *         region:
 *           type: string
 *           description: Região do ativo
 *           example: "US"
 *         market:
 *           type: string
 *           description: Mercado de negociação
 *           example: "us_market"
 *         marketState:
 *           type: string
 *           enum: [REGULAR, PRE, POST, PREPRE, POSTPOST, CLOSED]
 *           description: Estado atual do mercado para este ativo
 *           example: "REGULAR"
 *         exchange:
 *           type: string
 *           description: Código interno da bolsa
 *           example: "NMS"
 *         fullExchangeName:
 *           type: string
 *           description: Nome completo da bolsa de valores
 *           example: "NasdaqGS"
 *         exchangeTimezoneName:
 *           type: string
 *           description: Nome do fuso horário da bolsa (em português)
 *           example: "América/Novo_Iorque"
 *         exchangeTimezoneShortName:
 *           type: string
 *           description: Sigla do fuso horário da bolsa
 *           example: "EDT"
 *         gmtOffSetMilliseconds:
 *           type: integer
 *           description: Deslocamento em ms em relação ao GMT (negativo = atrás do GMT)
 *           example: -14400000
 *         exchangeDataDelayedBy:
 *           type: integer
 *           description: Atraso dos dados em minutos (0 = tempo real)
 *           example: 0
 *         sourceInterval:
 *           type: integer
 *           description: Intervalo de atualização da fonte em segundos
 *           example: 15
 *         priceHint:
 *           type: integer
 *           description: Número de casas decimais sugerido para exibição do preço
 *           example: 2
 *         quoteSourceName:
 *           type: string
 *           description: Fonte da cotação (em português)
 *           example: "Preço em tempo real da Nasdaq"
 *         regularMarketPrice:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Preço atual no mercado regular (em USD)
 *         regularMarketTime:
 *           $ref: '#/components/schemas/PriceMarketTime'
 *           description: Timestamp e horário local da última cotação
 *         regularMarketChange:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Variação absoluta do preço em relação ao fechamento anterior (em USD)
 *         regularMarketChangePercent:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Variação percentual em relação ao fechamento anterior
 *         regularMarketOpen:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Preço de abertura do pregão atual (em USD)
 *         regularMarketDayHigh:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Máxima do pregão atual (em USD)
 *         regularMarketDayLow:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Mínima do pregão atual (em USD)
 *         regularMarketDayRange:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Intervalo de preço do pregão no formato "min - max"
 *         regularMarketPreviousClose:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Preço de fechamento do pregão anterior (em USD)
 *         regularMarketVolume:
 *           $ref: '#/components/schemas/PriceValueLong'
 *           description: Volume de ações negociadas no pregão atual
 *         marketCap:
 *           $ref: '#/components/schemas/PriceValueLong'
 *           description: Capitalização de mercado total (em USD)
 *         sharesOutstanding:
 *           $ref: '#/components/schemas/PriceValueLong'
 *           description: Total de ações em circulação
 *         impliedSharesOutstanding:
 *           $ref: '#/components/schemas/PriceValueLong'
 *           description: Total de ações implicado pelo market cap e preço atual
 *         fiftyTwoWeekHigh:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Máxima das últimas 52 semanas (em USD)
 *         fiftyTwoWeekLow:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Mínima das últimas 52 semanas (em USD)
 *         fiftyTwoWeekRange:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Intervalo de 52 semanas no formato "min - max"
 *         fiftyTwoWeekHighChange:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Variação absoluta em relação à máxima de 52 semanas (em USD)
 *         fiftyTwoWeekHighChangePercent:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Variação percentual em relação à máxima de 52 semanas
 *         fiftyTwoWeekLowChange:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Variação absoluta em relação à mínima de 52 semanas (em USD)
 *         fiftyTwoWeekLowChangePercent:
 *           $ref: '#/components/schemas/PriceValue'
 *           description: Variação percentual em relação à mínima de 52 semanas
 *         firstTradeDateMilliseconds:
 *           type: integer
 *           format: int64
 *           description: Timestamp do primeiro pregão do ativo em milissegundos
 *           example: 345479400000
 *         hasPrePostMarketData:
 *           type: boolean
 *           description: Indica se há dados de pré e pós-mercado disponíveis
 *           example: true
 *         tradeable:
 *           type: boolean
 *           description: Indica se o ativo pode ser negociado diretamente pela plataforma
 *           example: false
 *         cryptoTradeable:
 *           type: boolean
 *           description: Indica se o ativo pode ser negociado como cripto
 *           example: false
 *         triggerable:
 *           type: boolean
 *           description: Indica se o ativo suporta alertas de preço
 *           example: true
 *         customPriceAlertConfidence:
 *           type: string
 *           enum: [LOW, HIGH]
 *           description: Confiança na precisão dos alertas de preço customizados
 *           example: "HIGH"
 *
 *     PriceResponse:
 *       type: object
 *       description: Resposta completa do endpoint de preço
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             source:
 *               type: string
 *               enum: [api, cache]
 *               description: Origem dos dados — api (Yahoo Finance) ou cache (Redis)
 *               example: "api"
 *             data:
 *               $ref: '#/components/schemas/PriceData'
 */

/**
 * @swagger
 * /price/{symbol}:
 *   get:
 *     tags: [Price]
 *     summary: Cotação em tempo real de um ativo
 *     description: >
 *       Retorna a cotação completa em tempo real de um ativo financeiro, incluindo preço atual,
 *       variação do dia, range intraday, volume, market cap, ações em circulação e range de 52 semanas.
 *
 *
 *       Todos os campos numéricos retornam no formato `{raw, fmt}` — use `raw` para cálculos
 *       e `fmt` para exibição. Campos de volume e market cap incluem também `longFmt` com
 *       separadores de milhar e `fmt` compacto com sufixo (K, M, B, T).
 *
 *
 *       Campos textuais são **automaticamente traduzidos para português**.
 *       Os dados são armazenados em cache por **20 segundos**.
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: "Ticker do ativo — maiúsculas ou minúsculas (ex: AAPL, aapl, MSFT, PETR4.SA)"
 *         examples:
 *           apple:
 *             summary: Apple Inc.
 *             value: aapl
 *           microsoft:
 *             summary: Microsoft Corp.
 *             value: msft
 *           petrobras:
 *             summary: Petrobras (B3)
 *             value: PETR4.SA
 *     responses:
 *       200:
 *         description: Cotação retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PriceResponse'
 *             example:
 *               data:
 *                 source: "api"
 *                 data:
 *                   symbol: "AAPL"
 *                   shortName: "Apple Inc."
 *                   longName: "Apple Inc."
 *                   currency: "USD"
 *                   quoteType: "EQUITY"
 *                   marketState: "REGULAR"
 *                   fullExchangeName: "NasdaqGS"
 *                   exchangeTimezoneName: "América/Novo_Iorque"
 *                   quoteSourceName: "Preço em tempo real da Nasdaq"
 *                   regularMarketPrice:
 *                     raw: 302.42
 *                     fmt: "302.42"
 *                   regularMarketChange:
 *                     raw: 0.17001343
 *                     fmt: "0.17"
 *                   regularMarketChangePercent:
 *                     raw: 0.056249272
 *                     fmt: "0.06%"
 *                   regularMarketOpen:
 *                     raw: 301.05
 *                     fmt: "301.05"
 *                   regularMarketDayHigh:
 *                     raw: 303.07
 *                     fmt: "303.07"
 *                   regularMarketDayLow:
 *                     raw: 300.4
 *                     fmt: "300.40"
 *                   regularMarketVolume:
 *                     raw: 7379818
 *                     fmt: "7.38M"
 *                     longFmt: "7,379,818"
 *                   marketCap:
 *                     raw: 4441750110208
 *                     fmt: "4.442T"
 *                     longFmt: "4.441.750.110.208"
 *                   fiftyTwoWeekHigh:
 *                     raw: 303.2
 *                     fmt: "303.20"
 *                   fiftyTwoWeekLow:
 *                     raw: 193.46
 *                     fmt: "193.46"
 *                   customPriceAlertConfidence: "HIGH"
 *                   triggerable: true
 *       400:
 *         description: Símbolo inválido ou mal formatado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Símbolo inválido"
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
 *               error: "Erro ao buscar preço"
 */
router.get("/:symbol", fetchPrice);

export default router;