import type{ Request, Response } from "express";
import { getTechnical } from "../services/yahoo.service.js";

export const fetchTechnical = async (req: Request, res: Response) => {
  const data = await getTechnical(req.params.symbol);
  res.json(data);
};