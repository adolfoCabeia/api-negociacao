import type{ Request, Response } from "express";
import { getOptions } from "../services/yahoo.service.js";

export const fetchOptions = async (req: Request, res: Response) => {
  const data = await getOptions(req.params.symbol);
  res.json(data);
};