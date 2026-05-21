import type{ Request, Response } from "express";
import { getESG } from "../services/yahoo.service.js";

export const fetchESG = async (req: Request, res: Response) => {
  const data = await getESG(req.params.symbol);
  res.json(data);
};