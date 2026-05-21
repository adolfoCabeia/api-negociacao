import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import { getCache, setCache } from "../utils/cache.js";
import { deepTranslate } from "../utils/translate.js";

const BASE_URL = "https://yahoo-finance127.p.rapidapi.com";
const headers = {
  "x-rapidapi-host": "yahoo-finance127.p.rapidapi.com",
  "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
};

const fetchAndTranslate = async <T>(
  cacheKey: string,
  url: string,
  ttl: number
): Promise<{ source: string; data: T }> => {
  const cached = await getCache(cacheKey);
  if (cached) return { source: "cache", data: cached };

  const res = await axios.get<T>(url, { headers });
  const translated = await deepTranslate(res.data);  

  await setCache(cacheKey, translated, ttl);
  return { source: "api", data: translated };
};

export const getPrice = (symbol: string) =>
  fetchAndTranslate(`price:${symbol}`, `${BASE_URL}/price/${symbol}`, 20);

export const getMultiQuote = (symbols: string) =>
  fetchAndTranslate(
    `multi:${symbols}`,
    `${BASE_URL}/multi-quote/${symbols}`,
    30
  );

export const getGainers = () =>
  fetchAndTranslate(
    "market:gainers",
    `${BASE_URL}/market-movers/DAY_GAINERS`,
    60
  );

export const getLosers = () =>
  fetchAndTranslate(
    "market:losers",
    `${BASE_URL}/market-movers/DAY_LOSERS`,
    60
  );

export const getTechnical = (symbol: string) =>
  fetchAndTranslate(
    `technical:${symbol}`,
    `${BASE_URL}/technical-insights/${symbol}`,
    300
  );

export const getESG = (symbol: string) =>
  fetchAndTranslate(
    `esg:${symbol}`,
    `${BASE_URL}/esg-peer-scores/${symbol}`,
    86400
  );

export const getOptions = (symbol: string) =>
  fetchAndTranslate(
    `options:${symbol}`,
    `${BASE_URL}/options/${symbol}`,
    90
  );

export const getHistoric = (
  symbol: string,
  interval: string,
  period: string
) =>
  fetchAndTranslate(
    `historic:${symbol}:${interval}:${period}`,
    `${BASE_URL}/historic/${symbol}/${interval}/${period}`,
    3600
  );

export const getNews = (symbol: string) =>
  fetchAndTranslate(`news:${symbol.toLowerCase()}`, `${BASE_URL}/news/${symbol}`, 300);