import { Router } from "express";
import { fetchTechnical } from "../controllers/analysis.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: Análise técnica e fundamentalista de ativos financeiros
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     OutlookPeriod:
 *       type: object
 *       description: Perspectiva técnica de um período (curto, médio ou longo prazo)
 *       properties:
 *         stateDescription:
 *           type: string
 *           description: Descrição textual do estado dos eventos técnicos
 *           example: "Todos os eventos são de alta."
 *         direction:
 *           type: string
 *           enum: [Bullish, Bearish, Neutral]
 *           description: Direção da tendência do ativo
 *           example: "Bullish"
 *         score:
 *           type: integer
 *           description: Pontuação de força da tendência do ativo (1–4)
 *           example: 2
 *         scoreDescription:
 *           type: string
 *           description: Descrição da pontuação do ativo
 *           example: "Evidência de Alta"
 *         sectorDirection:
 *           type: string
 *           enum: [Bullish, Bearish, Neutral]
 *           description: Direção da tendência do setor
 *           example: "Bearish"
 *         sectorScore:
 *           type: integer
 *           description: Pontuação de força do setor (1–4)
 *           example: 1
 *         sectorScoreDescription:
 *           type: string
 *           description: Descrição da pontuação do setor
 *           example: "Evidência de Baixa Fraca"
 *         indexDirection:
 *           type: string
 *           enum: [Bullish, Bearish, Neutral]
 *           description: Direção da tendência do índice de referência
 *           example: "Bearish"
 *         indexScore:
 *           type: integer
 *           description: Pontuação de força do índice (1–4)
 *           example: 2
 *         indexScoreDescription:
 *           type: string
 *           description: Descrição da pontuação do índice
 *           example: "Evidência de Baixa"
 *
 *     TechnicalEvents:
 *       type: object
 *       description: Eventos técnicos gerados pelo provedor de análise
 *       properties:
 *         provider:
 *           type: string
 *           description: Fornecedor dos dados técnicos
 *           example: "Trading Central"
 *         sector:
 *           type: string
 *           description: Setor de atuação da empresa
 *           example: "Technology"
 *         shortTermOutlook:
 *           $ref: '#/components/schemas/OutlookPeriod'
 *           description: Perspectiva técnica de curto prazo
 *         intermediateTermOutlook:
 *           $ref: '#/components/schemas/OutlookPeriod'
 *           description: Perspectiva técnica de médio prazo
 *         longTermOutlook:
 *           $ref: '#/components/schemas/OutlookPeriod'
 *           description: Perspectiva técnica de longo prazo
 *
 *     KeyTechnicals:
 *       type: object
 *       description: Níveis técnicos principais do ativo
 *       properties:
 *         provider:
 *           type: string
 *           example: "Trading Central"
 *         support:
 *           type: number
 *           format: float
 *           description: Nível de suporte técnico (em USD)
 *           example: 229.4
 *         resistance:
 *           type: number
 *           format: float
 *           description: Nível de resistência técnica (em USD)
 *           example: 303.2
 *         stopLoss:
 *           type: number
 *           format: float
 *           description: Nível sugerido de stop loss (em USD)
 *           example: 282.521817
 *
 *     Valuation:
 *       type: object
 *       description: Avaliação de valuation do ativo
 *       properties:
 *         color:
 *           type: integer
 *           description: Código de cor para representação visual (0 = vermelho/sobrevalorizado)
 *           example: 0
 *         description:
 *           type: string
 *           enum: [Overvalued, Undervalued, FairValue]
 *           description: Classificação textual do valuation
 *           example: "Overvalued"
 *         discount:
 *           type: string
 *           description: Percentual de desconto ou prêmio em relação ao valor justo
 *           example: "-7%"
 *         relativeValue:
 *           type: string
 *           enum: [Premium, Discount, FairValue]
 *           description: Valor relativo em relação ao mercado
 *           example: "Premium"
 *         provider:
 *           type: string
 *           example: "Trading Central"
 *
 *     InstrumentInfo:
 *       type: object
 *       description: Informações técnicas e de valuation do instrumento financeiro
 *       properties:
 *         technicalEvents:
 *           $ref: '#/components/schemas/TechnicalEvents'
 *         keyTechnicals:
 *           $ref: '#/components/schemas/KeyTechnicals'
 *         valuation:
 *           $ref: '#/components/schemas/Valuation'
 *
 *     CompanyMetrics:
 *       type: object
 *       description: >
 *         Métricas qualitativas da empresa ou setor, normalizadas entre 0 e 1.
 *         Valores mais próximos de 1 indicam melhor desempenho relativo.
 *       properties:
 *         innovativeness:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 1
 *           description: Índice de inovação (percentil no universo de empresas)
 *           example: 0.9981
 *         hiring:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 1
 *           description: Índice de contratações e crescimento de equipe
 *           example: 0.9512
 *         sustainability:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 1
 *           description: Índice de práticas sustentáveis (ESG)
 *           example: 0.1652
 *         insiderSentiments:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 1
 *           description: Sentimento dos insiders (compras/vendas de executivos)
 *           example: 0.3386
 *         earningsReports:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 1
 *           description: Qualidade e consistência dos resultados financeiros
 *           example: 0.8421
 *         dividends:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 1
 *           description: Histórico e atratividade de dividendos
 *           example: 0.0775
 *
 *     CompanySnapshot:
 *       type: object
 *       description: >
 *         Instantâneo comparativo da empresa versus a média do seu setor.
 *         O campo `sector` sempre retorna 0.5 como baseline de comparação.
 *       properties:
 *         sectorInfo:
 *           type: string
 *           description: Setor de atuação
 *           example: "Technology"
 *         company:
 *           $ref: '#/components/schemas/CompanyMetrics'
 *           description: Métricas da empresa analisada
 *         sector:
 *           $ref: '#/components/schemas/CompanyMetrics'
 *           description: Médias do setor (sempre 0.5 como referência de comparação)
 *
 *     Recommendation:
 *       type: object
 *       description: Recomendação de analistas para o ativo
 *       properties:
 *         targetPrice:
 *           type: number
 *           format: float
 *           description: Preço-alvo estimado pelos analistas (em USD)
 *           example: 325
 *         provider:
 *           type: string
 *           description: Instituição que emitiu a recomendação
 *           example: "Argus Research"
 *         rating:
 *           type: string
 *           enum: [BUY, SELL, HOLD, STRONG_BUY, STRONG_SELL]
 *           description: Classificação da recomendação
 *           example: "BUY"
 *
 *     SignificantDevelopment:
 *       type: object
 *       description: Evento ou notícia relevante recente sobre a empresa
 *       properties:
 *         headline:
 *           type: string
 *           description: Título da notícia ou evento (em português)
 *           example: "Apple Sports se expande para mais de 90 novos países e regiões"
 *         date:
 *           type: string
 *           format: date
 *           description: Data de publicação (formato YYYY-MM-DD)
 *           example: "2026-05-19"
 *
 *     SecReport:
 *       type: object
 *       description: Documento regulatório arquivado junto à SEC (Securities and Exchange Commission)
 *       properties:
 *         id:
 *           type: string
 *           description: Identificador único do arquivo no sistema da SEC
 *           example: "0000320193-26-000013_320193"
 *         type:
 *           type: string
 *           description: Categoria do documento (em português)
 *           example: "Relatórios Financeiros Periódicos"
 *         title:
 *           type: string
 *           description: Título completo do documento com tipo de formulário (em português)
 *           example: "10-Q : Relatórios Financeiros Periódicos"
 *         description:
 *           type: string
 *           description: Descrição detalhada do conteúdo e obrigação regulatória (em português)
 *           example: "Relatório trimestral de acordo com a Seção 13 ou 15(d)"
 *         filingDate:
 *           type: integer
 *           format: int64
 *           description: Data de arquivamento em Unix timestamp (milissegundos)
 *           example: 1777593600000
 *         snapshotUrl:
 *           type: string
 *           format: uri
 *           description: URL da imagem de prévia do documento
 *           example: "https://cdn.yahoofinance.com/prod/sec-reports-thumbnails/..."
 *         formType:
 *           type: string
 *           description: Tipo oficial do formulário SEC
 *           enum: [10-K, 10-Q, 8-K, DEF 14A, DEFA14A, S-8, S-3ASR, SC 13G/A]
 *           example: "10-Q"
 *
 *     TechnicalAnalysisResponse:
 *       type: object
 *       description: Resposta completa da análise técnica de um ativo
 *       properties:
 *         source:
 *           type: string
 *           enum: [api, cache]
 *           description: 'Origem dos dados — api (requisição ao Yahoo Finance) ou cache (Redis)'
 *           example: "api"
 *         data:
 *           type: object
 *           properties:
 *             symbol:
 *               type: string
 *               description: Símbolo/ticker do ativo consultado (em minúsculas)
 *               example: "aapl"
 *             instrumentInfo:
 *               $ref: '#/components/schemas/InstrumentInfo'
 *             companySnapshot:
 *               $ref: '#/components/schemas/CompanySnapshot'
 *             recommendation:
 *               $ref: '#/components/schemas/Recommendation'
 *             sigDevs:
 *               type: array
 *               description: Lista de eventos/notícias relevantes recentes (em português)
 *               items:
 *                 $ref: '#/components/schemas/SignificantDevelopment'
 *             secReports:
 *               type: array
 *               description: >
 *                 Histórico de documentos arquivados na SEC, ordenados do mais recente
 *                 ao mais antigo. Inclui relatórios trimestrais (10-Q), anuais (10-K),
 *                 eventos corporativos (8-K), declarações de procuração e registros de oferta.
 *               items:
 *                 $ref: '#/components/schemas/SecReport'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *           example: "Símbolo não encontrado"
 */

/**
 * @swagger
 * /analysis/technical/{symbol}:
 *   get:
 *     tags: [Analysis]
 *     summary: Análise técnica completa de um ativo
 *     description: >
 *       Retorna uma análise técnica abrangente do ativo solicitado, incluindo:
 *
 *       - **Perspectivas técnicas** (curto, médio e longo prazo) com direção, pontuação e comparativo com setor e índice
 *
 *       - **Níveis técnicos** — suporte, resistência e stop loss sugerido
 *
 *       - **Valuation** — se o ativo está sobrevalorizado, subvalorizado ou a preço justo
 *
 *       - **Snapshot da empresa** — métricas qualitativas (inovação, contratações, ESG, insiders, resultados, dividendos) comparadas ao setor
 *
 *       - **Recomendação de analistas** — preço-alvo e rating (BUY/SELL/HOLD)
 *
 *       - **Desenvolvimentos significativos** — notícias recentes relevantes
 *
 *       - **Documentos SEC** — histórico completo de arquivamentos regulatórios
 *
 *       Todos os campos textuais são **automaticamente traduzidos para português**.
 *       Os dados são armazenados em cache por **5 minutos (300 segundos)** para otimizar performance.
 *
 *       Dados fornecidos por **Trading Central** e **Argus Research** via Yahoo Finance.
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: "Ticker do ativo na bolsa (ex: AAPL, MSFT, PETR4.SA)"
 *         examples:
 *           apple:
 *             summary: Apple Inc.
 *             value: AAPL
 *           microsoft:
 *             summary: Microsoft Corp.
 *             value: MSFT
 *           petrobras:
 *             summary: Petrobras (B3)
 *             value: PETR4.SA
 *     responses:
 *       200:
 *         description: Análise técnica retornada com sucesso
 *         headers:
 *           X-Cache:
 *             schema:
 *               type: string
 *               enum: [HIT, MISS]
 *             description: Indica se a resposta veio do cache (HIT) ou da API (MISS)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TechnicalAnalysisResponse'
 *             example:
 *               source: "api"
 *               data:
 *                 symbol: "aapl"
 *                 instrumentInfo:
 *                   technicalEvents:
 *                     provider: "Trading Central"
 *                     sector: "Technology"
 *                     shortTermOutlook:
 *                       stateDescription: "Todos os eventos são de alta."
 *                       direction: "Bullish"
 *                       score: 2
 *                       scoreDescription: "Evidência de Alta"
 *                       sectorDirection: "Bearish"
 *                       sectorScore: 1
 *                       sectorScoreDescription: "Evidência de Baixa Fraca"
 *                       indexDirection: "Bearish"
 *                       indexScore: 2
 *                       indexScoreDescription: "Evidência de Baixa"
 *                   keyTechnicals:
 *                     provider: "Trading Central"
 *                     support: 229.4
 *                     resistance: 303.2
 *                     stopLoss: 282.52
 *                   valuation:
 *                     color: 0
 *                     description: "Overvalued"
 *                     discount: "-7%"
 *                     relativeValue: "Premium"
 *                     provider: "Trading Central"
 *                 recommendation:
 *                   targetPrice: 325
 *                   provider: "Argus Research"
 *                   rating: "BUY"
 *                 sigDevs:
 *                   - headline: "Apple Sports se expande para mais de 90 novos países e regiões"
 *                     date: "2026-05-19"
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
 *               error: "Erro ao buscar dados técnicos"
 */
router.get("/technical/:symbol", fetchTechnical);

export default router;