import type { Request, Response } from "express";
import { getNews } from "../services/yahoo.service.js";


export const fetchNews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { symbol } = req.params;

        if (!symbol || symbol.trim() === "") {
            res.status(400).json({ error: "Símbolo é obrigatório" });
            return;
        }

        const data = await getNews(symbol.toUpperCase());
        res.json(data);
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Erro ao buscar notícias";
        res.status(500).json({ error: message });
    }
};

