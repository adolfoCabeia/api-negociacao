import { Router } from "express";
import {
  fetchMultiQuote,
  fetchGainers,
  fetchLosers,
} from "../controllers/market.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Market
 *   description: Cotações em tempo real, maiores altas e baixas do mercado americano
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     FormattedValue:
 *       type: object
 *       description: Valor numérico com sua representação formatada para exibição
 *       properties:
 *         raw:
 *           type: number
 *           format: float
 *           description: Valor numérico bruto para cálculos
 *           example: 14.8499
 *         fmt:
 *           type: string
 *           description: Valor formatado para exibição ao usuário
 *           example: "14.85"
 *
 *     MarketQuote:
 *       type: object
 *       description: Cotação em tempo real de um ativo do mercado americano
 *       properties:
 *         symbol:
 *           type: string
 *           description: Ticker do ativo em maiúsculas
 *           example: "AAPL"
 *         shortName:
 *           type: string
 *           description: Nome abreviado da empresa (pode estar em português)
 *           example: "Apple Inc."
 *         fullExchangeName:
 *           type: string
 *           description: Nome completo da bolsa de listagem
 *           example: "NasdaqGS"
 *         exchange:
 *           type: string
 *           description: Código interno da bolsa
 *           example: "NMS"
 *         market:
 *           type: string
 *           description: Mercado de negociação
 *           example: "us_market"
 *         region:
 *           type: string
 *           description: Região do ativo
 *           example: "US"
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
 *         marketState:
 *           type: string
 *           enum: [REGULAR, PRE, POST, PREPRE, POSTPOST, CLOSED]
 *           description: Estado atual do mercado para este ativo
 *           example: "REGULAR"
 *         regularMarketPrice:
 *           $ref: '#/components/schemas/FormattedValue'
 *           description: Preço atual no mercado regular (em USD)
 *         regularMarketTime:
 *           $ref: '#/components/schemas/FormattedValue'
 *           description: Timestamp da última cotação (raw em Unix segundos, fmt em horário local)
 *         lastCloseTevEbitLtm:
 *           $ref: '#/components/schemas/FormattedValue'
 *           description: >
 *             Múltiplo TEV/EBIT dos últimos 12 meses (Total Enterprise Value / EBIT).
 *             Valores negativos indicam EBIT negativo (empresa não lucrativa operacionalmente).
 *         lastClosePriceToNNWCPerShare:
 *           $ref: '#/components/schemas/FormattedValue'
 *           description: >
 *             Relação entre preço e Net Net Working Capital por ação.
 *             Valores negativos indicam que o NNWC é negativo.
 *         quoteSourceName:
 *           type: string
 *           description: Fonte dos dados de cotação (em português)
 *           example: "Preço em tempo real da Nasdaq"
 *         exchangeTimezoneName:
 *           type: string
 *           description: Nome do fuso horário da bolsa (em português)
 *           example: "América/Novo_Iorque"
 *         exchangeTimezoneShortName:
 *           type: string
 *           description: Sigla do fuso horário
 *           example: "EDT"
 *         gmtOffSetMilliseconds:
 *           type: integer
 *           format: int64
 *           description: Deslocamento em ms em relação ao GMT
 *           example: -14400000
 *         firstTradeDateMilliseconds:
 *           type: integer
 *           format: int64
 *           description: Timestamp do primeiro pregão do ativo em milissegundos
 *           example: 345479400000
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
 *           description: Número de casas decimais sugerido para exibição
 *           example: 2
 *         hasPrePostMarketData:
 *           type: boolean
 *           description: Indica se há dados de pré/pós-mercado disponíveis
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
 *     ScreenerCriterion:
 *       type: object
 *       description: Critério individual de filtragem do screener
 *       properties:
 *         field:
 *           type: string
 *           description: Campo analisado pelo critério
 *           example: "percentchange"
 *         subField:
 *           type: string
 *           nullable: true
 *           description: Subcampo (quando aplicável)
 *         operators:
 *           type: array
 *           description: "Operadores de comparação — GT (maior), LT (menor), GTE (maior ou igual), EQ (igual)"
 *           items:
 *             type: string
 *             enum: [GT, LT, GTE, LTE, EQ, NEQ, BTWN]
 *           example: ["GT"]
 *         values:
 *           type: array
 *           description: Valores usados na comparação
 *           items:
 *             type: number
 *           example: [3]
 *         labelsSelected:
 *           type: array
 *           description: IDs de rótulos selecionados (para campos categóricos como região ou market cap)
 *           items:
 *             type: integer
 *           example: [1, 2, 3]
 *
 *     ScreenerCriteriaMeta:
 *       type: object
 *       description: Metadados e filtros aplicados pelo screener para selecionar os ativos
 *       properties:
 *         size:
 *           type: integer
 *           description: Número máximo de resultados solicitados
 *           example: 200
 *         offset:
 *           type: integer
 *           description: Deslocamento para paginação
 *           example: 0
 *         sortField:
 *           type: string
 *           description: Campo usado para ordenação dos resultados
 *           example: "percentchange"
 *         sortType:
 *           type: string
 *           enum: [ASC, DESC]
 *           description: "Direção da ordenação — DESC para maiores altas, ASC para maiores baixas"
 *           example: "DESC"
 *         quoteType:
 *           type: string
 *           description: Tipo de ativo filtrado
 *           example: "EQUITY"
 *         criteria:
 *           type: array
 *           description: Lista de critérios de filtragem aplicados
 *           items:
 *             $ref: '#/components/schemas/ScreenerCriterion'
 *         topOperator:
 *           type: string
 *           enum: [AND, OR]
 *           description: Operador lógico entre os critérios
 *           example: "AND"
 *
 *     ScreenerResult:
 *       type: object
 *       description: Resultado completo de um screener de mercado (gainers ou losers)
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identificador único do screener
 *           example: "ec5bebb9-b7b2-4474-9e5c-3e258b61cbe6"
 *         title:
 *           type: string
 *           description: Título do screener (em português)
 *           example: "Ganhadores do dia"
 *         description:
 *           type: string
 *           description: Descrição dos critérios do screener (em português)
 *           example: "Descubra as ações com os maiores ganhos no dia de negociação."
 *         canonicalName:
 *           type: string
 *           enum: [DAY_GAINERS, DAY_LOSERS]
 *           description: Identificador canônico do screener
 *           example: "DAY_GAINERS"
 *         criteriaMeta:
 *           $ref: '#/components/schemas/ScreenerCriteriaMeta'
 *         start:
 *           type: integer
 *           description: Índice do primeiro resultado retornado
 *           example: 0
 *         count:
 *           type: integer
 *           description: Número de ativos retornados nesta resposta
 *           example: 68
 *         total:
 *           type: integer
 *           description: Total de ativos que atendem aos critérios do screener
 *           example: 68
 *         quotes:
 *           type: array
 *           description: Lista de cotações dos ativos filtrados, ordenada por variação percentual
 *           items:
 *             $ref: '#/components/schemas/MarketQuote'
 *         predefinedScr:
 *           type: boolean
 *           description: Indica se é um screener predefinido pelo Yahoo Finance
 *           example: true
 *         isPremium:
 *           type: boolean
 *           description: Indica se o screener é exclusivo para usuários premium
 *           example: false
 *         versionId:
 *           type: integer
 *           description: Versão do screener
 *           example: 12
 *         iconUrl:
 *           type: string
 *           format: uri
 *           description: URL do ícone do screener
 *           example: "https://s.yimg.com/cv/apiv2/fin/img/assets/predefined_screeners/trendingUp.png"
 *         creationDate:
 *           type: integer
 *           format: int64
 *           description: Timestamp de criação do screener (milissegundos)
 *           example: 1473796102800
 *         lastUpdated:
 *           type: integer
 *           format: int64
 *           description: Timestamp da última atualização do screener (milissegundos)
 *           example: 1747134042853
 *
 *     ScreenerResponse:
 *       type: object
 *       description: Resposta do endpoint de screener (gainers ou losers)
 *       properties:
 *         source:
 *           type: string
 *           enum: [api, cache]
 *           description: Origem dos dados — api (Yahoo Finance) ou cache (Redis)
 *           example: "api"
 *         data:
 *           type: object
 *           properties:
 *             finance:
 *               type: object
 *               properties:
 *                 result:
 *                   type: array
 *                   description: Array com um único resultado do screener
 *                   items:
 *                     $ref: '#/components/schemas/ScreenerResult'
 *                   minItems: 1
 *                   maxItems: 1
 *                 error:
 *                   description: Erro retornado pelo Yahoo Finance (null em caso de sucesso)
 *                   nullable: true
 *                   example: null
 *
 *     MultiQuoteItem:
 *       type: object
 *       description: >
 *         Cotação de um ativo individual dentro de uma consulta multi-quote.
 *         Contém os mesmos campos de MarketQuote, com possíveis campos adicionais
 *         dependendo do tipo de ativo consultado.
 *       allOf:
 *         - $ref: '#/components/schemas/MarketQuote'
 *
 *     MultiQuoteResponse:
 *       type: object
 *       description: >
 *         Resposta da consulta de múltiplos ativos simultaneamente.
 *         Cada chave do objeto `data` é o ticker do ativo consultado (em maiúsculas).
 *       properties:
 *         source:
 *           type: string
 *           enum: [api, cache]
 *           description: Origem dos dados — api (Yahoo Finance) ou cache (Redis)
 *           example: "api"
 *         data:
 *           type: object
 *           description: Mapa de ticker para cotação do ativo
 *           additionalProperties:
 *             $ref: '#/components/schemas/MultiQuoteItem'
 *           example:
 *             TSLA:
 *               symbol: "TSLA"
 *               shortName: "Tesla, Inc."
 *               regularMarketPrice:
 *                 raw: 312.5
 *                 fmt: "312.50"
 *               marketState: "REGULAR"
 *             AAPL:
 *               symbol: "AAPL"
 *               shortName: "Apple Inc."
 *               regularMarketPrice:
 *                 raw: 195.89
 *                 fmt: "195.89"
 *               marketState: "REGULAR"
 */

/**
 * @swagger
 * /market/multi-quote/{symbols}:
 *   get:
 *     tags: [Market]
 *     summary: Cotações simultâneas de múltiplos ativos
 *     description: >
 *       Retorna cotações em tempo real de múltiplos ativos em uma única requisição.
 *       Os símbolos devem ser separados por vírgula no path.
 *
 *
 *       Cada ativo retorna um objeto com preço atual, exchange, fuso horário, estado
 *       do mercado, fonte da cotação e indicadores como TEV/EBIT e NNWC por ação.
 *       Campos textuais são **automaticamente traduzidos para português**.
 *
 *
 *       Os dados são armazenados em cache por **30 segundos**.
 *     parameters:
 *       - in: path
 *         name: symbols
 *         required: true
 *         schema:
 *           type: string
 *         description: "Tickers separados por vírgula (ex: tsla,aapl,msft)"
 *         examples:
 *           tres_ativos:
 *             summary: Tesla, Apple e Microsoft
 *             value: "tsla,aapl,msft"
 *           dois_ativos:
 *             summary: Apple e Google
 *             value: "aapl,googl"
 *           unico:
 *             summary: Apenas NVIDIA
 *             value: "nvda"
 *     responses:
 *       200:
 *         description: Cotações retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultiQuoteResponse'
 *       400:
 *         description: Símbolos inválidos ou mal formatados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Símbolos inválidos"
 *       429:
 *         description: Limite de requisições da API externa atingido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Rate limit excedido. Tente novamente em instantes."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao buscar cotações"
 */
router.get("/multi-quote/:symbols", fetchMultiQuote);

/**
 * @swagger
 * /market/gainers:
 *   get:
 *     tags: [Market]
 *     summary: Maiores altas do dia no mercado americano
 *     description: >
 *       Retorna os ativos do mercado americano com as maiores altas percentuais no pregão atual,
 *       filtrados pelos seguintes critérios automáticos do Yahoo Finance:
 *
 *
 *       - Variação percentual **acima de +3%**
 *
 *       - Apenas **ações (EQUITY)** americanas (região US)
 *
 *       - Market cap **médio, grande ou mega** (acima de USD 2 bilhões)
 *
 *       - Preço intraday **≥ USD 5** (exclui penny stocks)
 *
 *       - Volume diário **> 15.000 negócios**
 *
 *       - Exchanges OTC excluídas (PNK, OQB, OQX, OEM, OGM, XXX, OBB)
 *
 *
 *       Os resultados são ordenados do **maior para o menor ganho percentual** (sortType DESC).
 *       Campos textuais são **automaticamente traduzidos para português**.
 *       Os dados são armazenados em cache por **60 segundos**.
 *     responses:
 *       200:
 *         description: Lista de maiores altas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScreenerResponse'
 *             example:
 *               source: "api"
 *               data:
 *                 finance:
 *                   result:
 *                     - id: "ec5bebb9-b7b2-4474-9e5c-3e258b61cbe6"
 *                       title: "Ganhadores do dia"
 *                       description: "Descubra as ações com os maiores ganhos no dia de negociação."
 *                       canonicalName: "DAY_GAINERS"
 *                       start: 0
 *                       count: 68
 *                       total: 68
 *                       isPremium: false
 *                       quotes:
 *                         - symbol: "INFQ"
 *                           shortName: "Infleqtion, Inc."
 *                           fullExchangeName: "NYSE"
 *                           marketState: "REGULAR"
 *                           regularMarketPrice:
 *                             raw: 14.8499
 *                             fmt: "14.85"
 *                           quoteSourceName: "Preço em tempo real da Nasdaq"
 *                           exchangeTimezoneName: "América/Novo_Iorque"
 *                           customPriceAlertConfidence: "LOW"
 *                           triggerable: false
 *                   error: null
 *       429:
 *         description: Limite de requisições da API externa atingido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Rate limit excedido. Tente novamente em instantes."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao buscar maiores altas"
 */
router.get("/gainers", fetchGainers);

/**
 * @swagger
 * /market/losers:
 *   get:
 *     tags: [Market]
 *     summary: Maiores baixas do dia no mercado americano
 *     description: >
 *       Retorna os ativos do mercado americano com as maiores quedas percentuais no pregão atual,
 *       filtrados pelos seguintes critérios automáticos do Yahoo Finance:
 *
 *
 *       - Variação percentual **abaixo de -2,5%**
 *
 *       - Apenas **ações (EQUITY)** americanas (região US)
 *
 *       - Market cap **médio, grande ou mega** (acima de USD 2 bilhões)
 *
 *       - Preço intraday **≥ USD 5** (exclui penny stocks)
 *
 *       - Volume diário **> 20.000 negócios**
 *
 *       - Exchanges OTC excluídas (PNK, OQB, OQX, OEM, OGM, XXX, OBB)
 *
 *
 *       Os resultados são ordenados da **maior para a menor queda percentual** (sortType ASC).
 *       Campos textuais são **automaticamente traduzidos para português**.
 *       Os dados são armazenados em cache por **60 segundos**.
 *     responses:
 *       200:
 *         description: Lista de maiores baixas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScreenerResponse'
 *             example:
 *               source: "api"
 *               data:
 *                 finance:
 *                   result:
 *                     - id: "8ecefa87-a8b0-434a-9b39-e061a0baef9b"
 *                       title: "Day Losers"
 *                       description: "Descubra as ações com as maiores perdas no dia de negociação."
 *                       canonicalName: "DAY_LOSERS"
 *                       start: 0
 *                       count: 134
 *                       total: 134
 *                       isPremium: false
 *                       quotes:
 *                         - symbol: "INTU"
 *                           shortName: "Intuit Inc."
 *                           fullExchangeName: "NasdaqGS"
 *                           marketState: "REGULAR"
 *                           regularMarketPrice:
 *                             raw: 310.17
 *                             fmt: "310.17"
 *                           quoteSourceName: "Preço em tempo real da Nasdaq"
 *                           exchangeTimezoneName: "América/Novo_Iorque"
 *                           customPriceAlertConfidence: "HIGH"
 *                           triggerable: true
 *                   error: null
 *       429:
 *         description: Limite de requisições da API externa atingido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Rate limit excedido. Tente novamente em instantes."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao buscar maiores baixas"
 */
router.get("/losers", fetchLosers);

export default router;