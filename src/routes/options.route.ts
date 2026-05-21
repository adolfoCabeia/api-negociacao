import { Router } from "express";
import { fetchOptions } from "../controllers/options.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Options
 *   description: Cadeia de opções (calls e puts) de ativos do mercado americano
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     OptionFormattedValue:
 *       type: object
 *       description: >
 *         Valor numérico com representação formatada. Campos de volume e open interest
 *         incluem também `longFmt` (formatação com separadores de milhar).
 *       properties:
 *         raw:
 *           type: number
 *           format: float
 *           description: Valor numérico bruto para cálculos
 *           example: 302.535
 *         fmt:
 *           type: string
 *           description: Valor formatado para exibição
 *           example: "302.54"
 *         longFmt:
 *           type: string
 *           description: Valor com separadores de milhar (presente em volume e open interest)
 *           example: "14,426"
 *
 *     OptionFormattedDate:
 *       type: object
 *       description: Data formatada em três representações
 *       properties:
 *         raw:
 *           type: integer
 *           format: int64
 *           description: Timestamp Unix em segundos
 *           example: 1779408000
 *         fmt:
 *           type: string
 *           description: Data curta no formato YYYY-MM-DD
 *           example: "2026-05-22"
 *         longFmt:
 *           type: string
 *           description: Data e hora no formato YYYY-MM-DDTHH:MM
 *           example: "2026-05-22T00:00"
 *
 *     OptionContract:
 *       type: object
 *       description: >
 *         Contrato individual de opção (call ou put).
 *         Todos os preços estão em USD por ação. Cada contrato representa 100 ações.
 *       properties:
 *         contractSymbol:
 *           type: string
 *           description: >
 *             Símbolo do contrato no padrão OCC — concatenação de ticker (6 chars),
 *             data de expiração (YYMMDD), tipo (C=call/P=put) e strike (8 dígitos, × 1000).
 *           example: "AAPL260522C00300000"
 *         strike:
 *           $ref: '#/components/schemas/OptionFormattedValue'
 *           description: Preço de exercício do contrato (em USD)
 *         currency:
 *           type: string
 *           description: Moeda do contrato
 *           example: "USD"
 *         contractSize:
 *           type: string
 *           enum: [REGULAR, MINI]
 *           description: "Tamanho do contrato — REGULAR representa 100 ações"
 *           example: "REGULAR"
 *         expiration:
 *           $ref: '#/components/schemas/OptionFormattedDate'
 *           description: Data de expiração do contrato
 *         lastTradeDate:
 *           $ref: '#/components/schemas/OptionFormattedDate'
 *           description: Data e hora do último negócio realizado
 *         lastPrice:
 *           $ref: '#/components/schemas/OptionFormattedValue'
 *           description: Preço do último negócio (em USD)
 *         bid:
 *           $ref: '#/components/schemas/OptionFormattedValue'
 *           description: Maior preço de compra atual no book (em USD)
 *         ask:
 *           $ref: '#/components/schemas/OptionFormattedValue'
 *           description: Menor preço de venda atual no book (em USD)
 *         change:
 *           $ref: '#/components/schemas/OptionFormattedValue'
 *           description: Variação absoluta do preço em relação ao fechamento anterior (em USD)
 *         percentChange:
 *           $ref: '#/components/schemas/OptionFormattedValue'
 *           description: Variação percentual em relação ao fechamento anterior
 *         volume:
 *           $ref: '#/components/schemas/OptionFormattedValue'
 *           description: Número de contratos negociados no dia atual
 *         openInterest:
 *           $ref: '#/components/schemas/OptionFormattedValue'
 *           description: Número total de contratos em aberto (não liquidados)
 *         impliedVolatility:
 *           $ref: '#/components/schemas/OptionFormattedValue'
 *           description: >
 *             Volatilidade implícita calculada pelo modelo Black-Scholes.
 *             O campo `raw` é decimal (ex: 0.209 = 20,9%); o campo `fmt` já vem em
 *             percentual formatado (ex: "20.95%"). Valores muito altos em opções deep
 *             ITM refletem baixa liquidez, não alta volatilidade real.
 *         inTheMoney:
 *           type: boolean
 *           description: >
 *             Indica se a opção está in-the-money (ITM).
 *             Para calls: strike < preço do ativo; para puts: strike > preço do ativo.
 *           example: true
 *
 *     OptionChainEntry:
 *       type: object
 *       description: >
 *         Cadeia de opções de uma data de expiração específica.
 *         Contém as listas de calls e puts para todos os strikes disponíveis nessa data.
 *       properties:
 *         expirationDate:
 *           type: integer
 *           format: int64
 *           description: Timestamp Unix da data de expiração (segundos)
 *           example: 1779408000
 *         hasMiniOptions:
 *           type: boolean
 *           description: Indica se existem mini-opções disponíveis para esta expiração
 *           example: false
 *         calls:
 *           type: array
 *           description: >
 *             Lista de contratos de compra (calls), ordenados por strike crescente.
 *             Calls ITM têm strike abaixo do preço atual do ativo.
 *           items:
 *             $ref: '#/components/schemas/OptionContract'
 *         puts:
 *           type: array
 *           description: >
 *             Lista de contratos de venda (puts), ordenados por strike crescente.
 *             Puts ITM têm strike acima do preço atual do ativo.
 *           items:
 *             $ref: '#/components/schemas/OptionContract'
 *
 *     OptionUnderlyingQuote:
 *       type: object
 *       description: Cotação completa do ativo subjacente no momento da consulta
 *       properties:
 *         symbol:
 *           type: string
 *           description: Ticker do ativo
 *           example: "AAPL"
 *         shortName:
 *           type: string
 *           description: Nome abreviado da empresa
 *           example: "Apple Inc."
 *         longName:
 *           type: string
 *           description: Nome completo da empresa
 *           example: "Apple Inc."
 *         displayName:
 *           type: string
 *           description: Nome de exibição simplificado
 *           example: "Apple"
 *         currency:
 *           type: string
 *           description: Moeda de cotação
 *           example: "USD"
 *         financialCurrency:
 *           type: string
 *           description: Moeda usada nos demonstrativos financeiros
 *           example: "USD"
 *         quoteType:
 *           type: string
 *           example: "EQUITY"
 *         marketState:
 *           type: string
 *           enum: [REGULAR, PRE, POST, PREPRE, POSTPOST, CLOSED]
 *           example: "REGULAR"
 *         regularMarketPrice:
 *           type: number
 *           format: float
 *           description: Preço atual no mercado regular (em USD)
 *           example: 302.535
 *         regularMarketChange:
 *           type: number
 *           format: float
 *           description: Variação absoluta do preço no pregão atual
 *           example: 0.285
 *         regularMarketChangePercent:
 *           type: number
 *           format: float
 *           description: Variação percentual no pregão atual
 *           example: 0.09429402
 *         regularMarketOpen:
 *           type: number
 *           format: float
 *           description: Preço de abertura do pregão atual
 *           example: 301.05
 *         regularMarketDayHigh:
 *           type: number
 *           format: float
 *           description: Máxima do pregão atual
 *           example: 303.07
 *         regularMarketDayLow:
 *           type: number
 *           format: float
 *           description: Mínima do pregão atual
 *           example: 300.4
 *         regularMarketDayRange:
 *           type: string
 *           description: Intervalo de preço do pregão no formato "min - max"
 *           example: "300,4 - 303,07"
 *         regularMarketVolume:
 *           type: integer
 *           format: int64
 *           description: Volume negociado no pregão atual
 *           example: 7252915
 *         regularMarketPreviousClose:
 *           type: number
 *           format: float
 *           description: Preço de fechamento do pregão anterior
 *           example: 302.25
 *         regularMarketTime:
 *           type: integer
 *           format: int64
 *           description: Timestamp da última cotação (Unix segundos)
 *           example: 1779374161
 *         bid:
 *           type: number
 *           format: float
 *           description: Maior preço de compra no book de ordens (em USD)
 *           example: 297.73
 *         ask:
 *           type: number
 *           format: float
 *           description: Menor preço de venda no book de ordens (em USD)
 *           example: 301.98
 *         bidSize:
 *           type: integer
 *           description: Quantidade de lotes no bid
 *           example: 1
 *         askSize:
 *           type: integer
 *           description: Quantidade de lotes no ask
 *           example: 4
 *         marketCap:
 *           type: integer
 *           format: int64
 *           description: Capitalização de mercado total (em USD)
 *           example: 4443439366144
 *         sharesOutstanding:
 *           type: integer
 *           format: int64
 *           description: Total de ações em circulação
 *           example: 14687356000
 *         fiftyTwoWeekHigh:
 *           type: number
 *           format: float
 *           description: Máxima das últimas 52 semanas (em USD)
 *           example: 303.2
 *         fiftyTwoWeekLow:
 *           type: number
 *           format: float
 *           description: Mínima das últimas 52 semanas (em USD)
 *           example: 193.46
 *         fiftyTwoWeekRange:
 *           type: string
 *           description: Intervalo de 52 semanas no formato "min - max"
 *           example: "193,46 - 303,2"
 *         fiftyTwoWeekChangePercent:
 *           type: number
 *           format: float
 *           description: Variação percentual acumulada nas últimas 52 semanas
 *           example: 50.104298
 *         fiftyDayAverage:
 *           type: number
 *           format: float
 *           description: Média móvel de 50 dias (em USD)
 *           example: 268.607
 *         twoHundredDayAverage:
 *           type: number
 *           format: float
 *           description: Média móvel de 200 dias (em USD)
 *           example: 260.56125
 *         averageDailyVolume3Month:
 *           type: integer
 *           format: int64
 *           description: Volume médio diário dos últimos 3 meses
 *           example: 43681522
 *         averageDailyVolume10Day:
 *           type: integer
 *           format: int64
 *           description: Volume médio diário dos últimos 10 dias
 *           example: 44369990
 *         trailingPE:
 *           type: number
 *           format: float
 *           description: P/L trailing (com base no LPA dos últimos 12 meses)
 *           example: 36.67091
 *         forwardPE:
 *           type: number
 *           format: float
 *           description: P/L forward (com base no LPA estimado)
 *           example: 31.501493
 *         priceToBook:
 *           type: number
 *           format: float
 *           description: Relação preço / valor patrimonial por ação
 *           example: 41.671486
 *         bookValue:
 *           type: number
 *           format: float
 *           description: Valor patrimonial por ação (em USD)
 *           example: 7.26
 *         epsTrailingTwelveMonths:
 *           type: number
 *           format: float
 *           description: Lucro por ação (LPA) dos últimos 12 meses
 *           example: 8.25
 *         epsForward:
 *           type: number
 *           format: float
 *           description: LPA estimado para os próximos 12 meses
 *           example: 9.60383
 *         dividendRate:
 *           type: number
 *           format: float
 *           description: Dividendo por ação anualizado esperado (em USD)
 *           example: 1.08
 *         dividendYield:
 *           type: number
 *           format: float
 *           description: Dividend yield anualizado esperado (em %)
 *           example: 0.36
 *         trailingAnnualDividendRate:
 *           type: number
 *           format: float
 *           description: Dividendo por ação pago nos últimos 12 meses (em USD)
 *           example: 1.04
 *         trailingAnnualDividendYield:
 *           type: number
 *           format: float
 *           description: "Dividend yield dos últimos 12 meses (decimal, ex: 0.00344 = 0.344%)"
 *           example: 0.0034408602
 *         dividendDate:
 *           type: integer
 *           format: int64
 *           description: Timestamp da próxima data de pagamento de dividendos (Unix segundos)
 *           example: 1778716800
 *         earningsTimestamp:
 *           type: integer
 *           format: int64
 *           description: Timestamp do último resultado trimestral divulgado (Unix segundos)
 *           example: 1777579200
 *         earningsTimestampStart:
 *           type: integer
 *           format: int64
 *           description: Início da janela estimada para o próximo resultado (Unix segundos)
 *           example: 1785441600
 *         earningsTimestampEnd:
 *           type: integer
 *           format: int64
 *           description: Fim da janela estimada para o próximo resultado (Unix segundos)
 *           example: 1785441600
 *         isEarningsDateEstimate:
 *           type: boolean
 *           description: Indica se a data do próximo resultado é uma estimativa
 *           example: true
 *         averageAnalystRating:
 *           type: string
 *           description: Avaliação média dos analistas (em português)
 *           example: "2.0 - Comprar"
 *         quoteSourceName:
 *           type: string
 *           description: Fonte da cotação (em português)
 *           example: "Preço em tempo real da Nasdaq"
 *         exchangeTimezoneName:
 *           type: string
 *           description: Nome do fuso horário da bolsa (em português)
 *           example: "América/Novo_Iorque"
 *         fullExchangeName:
 *           type: string
 *           example: "NasdaqGS"
 *         exchange:
 *           type: string
 *           example: "NMS"
 *         market:
 *           type: string
 *           example: "us_market"
 *         hasPrePostMarketData:
 *           type: boolean
 *           example: true
 *         tradeable:
 *           type: boolean
 *           example: false
 *         triggerable:
 *           type: boolean
 *           example: true
 *         customPriceAlertConfidence:
 *           type: string
 *           enum: [LOW, HIGH]
 *           example: "HIGH"
 *         esgPopulated:
 *           type: boolean
 *           description: Indica se há dados ESG disponíveis
 *           example: false
 *         corporateActions:
 *           type: array
 *           description: Lista de ações corporativas recentes (splits, dividendos especiais etc.)
 *           items:
 *             type: object
 *           example: []
 *
 *     OptionChainResult:
 *       type: object
 *       description: Resultado completo da cadeia de opções de um ativo
 *       properties:
 *         underlyingSymbol:
 *           type: string
 *           description: Ticker do ativo subjacente em maiúsculas
 *           example: "AAPL"
 *         expirationDates:
 *           type: array
 *           description: >
 *             Lista de todas as datas de expiração disponíveis em Unix timestamp (segundos),
 *             ordenadas cronologicamente do mais próximo ao mais distante.
 *             A resposta padrão retorna apenas a cadeia da primeira data (mais próxima).
 *           items:
 *             type: integer
 *             format: int64
 *           example: [1779408000, 1779753600, 1780012800, 1781222400]
 *         strikes:
 *           type: array
 *           description: Lista de todos os preços de exercício disponíveis para o ativo (em USD)
 *           items:
 *             type: number
 *             format: float
 *           example: [110, 120, 130, 200, 250, 300, 305, 310, 315, 400]
 *         hasMiniOptions:
 *           type: boolean
 *           description: Indica se o ativo possui mini-opções disponíveis
 *           example: false
 *         quote:
 *           $ref: '#/components/schemas/OptionUnderlyingQuote'
 *           description: Cotação completa do ativo subjacente no momento da consulta
 *         options:
 *           type: array
 *           description: >
 *             Cadeia de opções da data de expiração mais próxima (ou da data selecionada).
 *             Contém um único elemento com as listas de calls e puts para aquela data.
 *           items:
 *             $ref: '#/components/schemas/OptionChainEntry'
 *           minItems: 1
 *           maxItems: 1
 *
 *     OptionsResponse:
 *       type: object
 *       description: Resposta completa do endpoint de cadeia de opções
 *       properties:
 *         source:
 *           type: string
 *           enum: [api, cache]
 *           description: Origem dos dados — api (Yahoo Finance) ou cache (Redis)
 *           example: "api"
 *         data:
 *           type: object
 *           properties:
 *             optionChain:
 *               type: object
 *               properties:
 *                 result:
 *                   type: array
 *                   description: Array com o resultado da cadeia de opções (sempre 1 item)
 *                   items:
 *                     $ref: '#/components/schemas/OptionChainResult'
 *                   minItems: 1
 *                   maxItems: 1
 *                 error:
 *                   description: Erro retornado pelo Yahoo Finance (null em caso de sucesso)
 *                   nullable: true
 *                   example: null
 */

/**
 * @swagger
 * /options/{symbol}:
 *   get:
 *     tags: [Options]
 *     summary: Cadeia de opções (calls e puts) de um ativo
 *     description: >
 *       Retorna a cadeia completa de opções do ativo solicitado para a data de expiração
 *       mais próxima disponível, incluindo todas as calls e puts com seus respectivos
 *       preços, volatilidade implícita e open interest.
 *
 *
 *       A resposta também inclui a cotação completa do ativo subjacente com métricas de
 *       mercado, fundamentos e datas relevantes (dividendos, resultados).
 *
 *
 *       **Estrutura da cadeia:**
 *       `data.optionChain.result[0]` contém `expirationDates[]` com todas as datas
 *       disponíveis, `strikes[]` com todos os preços de exercício, e `options[0]` com as
 *       listas `calls[]` e `puts[]` da data mais próxima. Cada contrato tem o campo
 *       `inTheMoney` já calculado pelo Yahoo Finance.
 *
 *
 *       **Símbolo do contrato (OCC):** o campo `contractSymbol` segue o padrão
 *       `TICKER + YYMMDD + C/P + STRIKE×1000` com padding de 8 dígitos.
 *       Exemplo: `AAPL260522C00300000` = call AAPL vencendo 22/05/2026 com strike USD 300.
 *
 *
 *       Campos textuais são **automaticamente traduzidos para português**.
 *       Os dados são armazenados em cache por **90 segundos**.
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: "Ticker do ativo (ex: AAPL, MSFT, TSLA)"
 *         examples:
 *           apple:
 *             summary: Apple Inc.
 *             value: AAPL
 *           microsoft:
 *             summary: Microsoft Corp.
 *             value: MSFT
 *           tesla:
 *             summary: Tesla Inc.
 *             value: TSLA
 *     responses:
 *       200:
 *         description: Cadeia de opções retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OptionsResponse'
 *             example:
 *               source: "api"
 *               data:
 *                 optionChain:
 *                   result:
 *                     - underlyingSymbol: "AAPL"
 *                       expirationDates: [1779408000, 1779753600, 1780012800]
 *                       strikes: [110, 200, 250, 280, 300, 302.5, 305, 310, 325, 400]
 *                       hasMiniOptions: false
 *                       quote:
 *                         symbol: "AAPL"
 *                         shortName: "Apple Inc."
 *                         regularMarketPrice: 302.535
 *                         regularMarketChangePercent: 0.09429402
 *                         marketCap: 4443439366144
 *                         trailingPE: 36.67091
 *                         fiftyTwoWeekHigh: 303.2
 *                         fiftyTwoWeekLow: 193.46
 *                         dividendYield: 0.36
 *                         averageAnalystRating: "2.0 - Comprar"
 *                         marketState: "REGULAR"
 *                       options:
 *                         - expirationDate: 1779408000
 *                           hasMiniOptions: false
 *                           calls:
 *                             - contractSymbol: "AAPL260522C00300000"
 *                               strike:
 *                                 raw: 300
 *                                 fmt: "300.00"
 *                               lastPrice:
 *                                 raw: 3.45
 *                                 fmt: "3.45"
 *                               bid:
 *                                 raw: 3.35
 *                                 fmt: "3.35"
 *                               ask:
 *                                 raw: 3.4
 *                                 fmt: "3.40"
 *                               impliedVolatility:
 *                                 raw: 0.20948056152343747
 *                                 fmt: "20.95%"
 *                               volume:
 *                                 raw: 4641
 *                                 fmt: "4,641"
 *                                 longFmt: "4,641"
 *                               openInterest:
 *                                 raw: 14426
 *                                 fmt: "14,426"
 *                                 longFmt: "14,426"
 *                               inTheMoney: true
 *                               contractSize: "REGULAR"
 *                               currency: "USD"
 *                           puts:
 *                             - contractSymbol: "AAPL260522P00305000"
 *                               strike:
 *                                 raw: 305
 *                                 fmt: "305.00"
 *                               lastPrice:
 *                                 raw: 3.4
 *                                 fmt: "3.40"
 *                               bid:
 *                                 raw: 3.3
 *                                 fmt: "3.30"
 *                               ask:
 *                                 raw: 3.4
 *                                 fmt: "3.40"
 *                               impliedVolatility:
 *                                 raw: 0.21411918701171873
 *                                 fmt: "21.41%"
 *                               volume:
 *                                 raw: 1188
 *                                 fmt: "1,188"
 *                                 longFmt: "1,188"
 *                               openInterest:
 *                                 raw: 4169
 *                                 fmt: "4,169"
 *                                 longFmt: "4,169"
 *                               inTheMoney: true
 *                               contractSize: "REGULAR"
 *                               currency: "USD"
 *                   error: null
 *       400:
 *         description: Símbolo inválido ou mal formatado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Símbolo inválido"
 *       404:
 *         description: Ativo não encontrado ou sem opções disponíveis no Yahoo Finance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Símbolo não encontrado ou sem cadeia de opções disponível"
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
 *               error: "Erro ao buscar cadeia de opções"
 */
router.get("/:symbol", fetchOptions);

export default router;