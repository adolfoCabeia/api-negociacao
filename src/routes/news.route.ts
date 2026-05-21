import { Router } from "express";
import { fetchNews } from "../controllers/news.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: News
 *   description: Notícias financeiras recentes por símbolo de ativo
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     NewsThumbnailResolution:
 *       type: object
 *       description: Uma resolução disponível da imagem em miniatura da notícia
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           description: URL direta da imagem nesta resolução
 *           example: "https://s.yimg.com/uu/api/res/1.2/abc123/image.jpg"
 *         width:
 *           type: integer
 *           description: Largura da imagem em pixels
 *           example: 640
 *         height:
 *           type: integer
 *           description: Altura da imagem em pixels
 *           example: 360
 *         tag:
 *           type: string
 *           description: Identificador do tipo de resolução
 *           example: "original"
 *
 *     NewsThumbnail:
 *       type: object
 *       description: Imagem em miniatura associada à notícia em múltiplas resoluções
 *       properties:
 *         resolutions:
 *           type: array
 *           description: Lista de resoluções disponíveis para a miniatura
 *           items:
 *             $ref: '#/components/schemas/NewsThumbnailResolution'
 *
 *     NewsItem:
 *       type: object
 *       description: Um artigo ou notícia individual retornado pelo Yahoo Finance
 *       properties:
 *         id:
 *           type: string
 *           description: Identificador único da notícia
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         title:
 *           type: string
 *           description: Título da notícia (em português após tradução automática)
 *           example: "Tesla supera estimativas de lucro no segundo trimestre"
 *         publisher:
 *           type: string
 *           description: Nome do veículo que publicou a notícia
 *           example: "Reuters"
 *         link:
 *           type: string
 *           format: uri
 *           description: URL completa para o artigo original
 *           example: "https://finance.yahoo.com/news/tesla-earnings-q2-2026"
 *         providerPublishTime:
 *           type: integer
 *           format: int64
 *           description: Timestamp de publicação da notícia no provedor (Unix segundos)
 *           example: 1779374400
 *         type:
 *           type: string
 *           enum: [STORY, VIDEO, PR_NEWS_WIRE, GLOBE_NEWSWIRE]
 *           description: "Tipo do conteúdo — STORY é artigo de texto, VIDEO é conteúdo em vídeo, PR_NEWS_WIRE e GLOBE_NEWSWIRE são comunicados de imprensa"
 *           example: "STORY"
 *         thumbnail:
 *           $ref: '#/components/schemas/NewsThumbnail'
 *           description: Imagem em miniatura da notícia (pode estar ausente em alguns itens)
 *         relatedTickers:
 *           type: array
 *           description: Tickers de ativos relacionados ao artigo
 *           items:
 *             type: string
 *           example: ["TSLA", "AAPL", "NVDA"]
 *
 *     NewsResponse:
 *       type: object
 *       description: Resposta completa do endpoint de notícias
 *       properties:
 *         source:
 *           type: string
 *           enum: [api, cache]
 *           description: Origem dos dados — api (Yahoo Finance) ou cache (Redis)
 *           example: "api"
 *         data:
 *           type: array
 *           description: >
 *             Lista de notícias recentes relacionadas ao símbolo consultado,
 *             ordenadas da mais recente para a mais antiga.
 *             Títulos e textos são **automaticamente traduzidos para português**.
 *           items:
 *             $ref: '#/components/schemas/NewsItem'
 */

/**
 * @swagger
 * /news/{symbol}:
 *   get:
 *     tags: [News]
 *     summary: Notícias recentes de um ativo
 *     description: >
 *       Retorna as notícias financeiras mais recentes do Yahoo Finance
 *       relacionadas ao símbolo informado, incluindo título, publisher,
 *       link para o artigo, data de publicação, tipo de conteúdo,
 *       miniatura e tickers relacionados.
 *
 *
 *       Títulos e campos textuais são **automaticamente traduzidos para português**
 *       via MyMemory API.
 *       Os dados são armazenados em cache por **5 minutos (300 segundos)**.
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: "Ticker do ativo — maiúsculas ou minúsculas (ex: TSLA, aapl, MSFT)"
 *         examples:
 *           tesla:
 *             summary: Tesla Inc.
 *             value: TSLA
 *           apple:
 *             summary: Apple Inc.
 *             value: AAPL
 *           microsoft:
 *             summary: Microsoft Corp.
 *             value: MSFT
 *     responses:
 *       200:
 *         description: Notícias retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewsResponse'
 *             example:
 *               source: "api"
 *               data:
 *                 - id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   title: "Tesla supera estimativas de lucro no segundo trimestre"
 *                   publisher: "Reuters"
 *                   link: "https://finance.yahoo.com/news/tesla-earnings-q2-2026"
 *                   providerPublishTime: 1779374400
 *                   type: "STORY"
 *                   thumbnail:
 *                     resolutions:
 *                       - url: "https://s.yimg.com/uu/api/res/1.2/abc123/image.jpg"
 *                         width: 640
 *                         height: 360
 *                         tag: "original"
 *                   relatedTickers: ["TSLA"]
 *                 - id: "b2c3d4e5-f6a7-8901-bcde-f12345678901"
 *                   title: "Robotaxi da Tesla começa operações em Austin"
 *                   publisher: "Bloomberg"
 *                   link: "https://finance.yahoo.com/news/tesla-robotaxi-austin"
 *                   providerPublishTime: 1779288000
 *                   type: "STORY"
 *                   relatedTickers: ["TSLA", "UBER"]
 *       400:
 *         description: Símbolo inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Símbolo é obrigatório"
 *       404:
 *         description: Ativo não encontrado ou sem notícias disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Nenhuma notícia encontrada para este símbolo"
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
 *               error: "Erro ao buscar notícias"
 */
router.get("/:symbol", fetchNews);

export default router;