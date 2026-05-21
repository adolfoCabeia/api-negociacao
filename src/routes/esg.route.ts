import { Router } from "express";
import { fetchESG } from "../controllers/esg.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ESG
 */

/**
 * @swagger
 * /esg/{symbol}:
 *   get:
 *     tags: [ESG]
 *     summary: ESG Score da empresa
 */
router.get("/:symbol", fetchESG);

export default router;