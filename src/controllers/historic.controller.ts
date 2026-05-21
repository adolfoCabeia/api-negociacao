import type{ Request, Response } from "express";
import { getHistoric } from "../services/yahoo.service.js";

export const fetchHistoric = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const { interval = "1d", period = "15d" } = req.query;

  const data = await getHistoric(symbol, interval as string, period as string);

  res.json(data);
};