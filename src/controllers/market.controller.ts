import type{ Request, Response } from "express";
import { getMultiQuote, getGainers, getLosers } from "../services/yahoo.service.js";

export const fetchMultiQuote = async (req: Request, res: Response) => {
  const data = await getMultiQuote(req.params.symbols);
  res.json(data);
};

export const fetchGainers = async (_: Request, res: Response) => {
  const data = await getGainers();
  res.json(data);
};

export const fetchLosers = async (_: Request, res: Response) => {
  const data = await getLosers();
  res.json(data);
};