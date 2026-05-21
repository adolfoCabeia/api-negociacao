import axios from "axios";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

// Cache local de traduções para não repetir chamadas
const translationCache = new Map<string, string>();

export const translateText = async (
  text: string,
  sourceLang = "en"
): Promise<string> => {
  if (!text || text.trim() === "") return text;

  const cacheKey = `${sourceLang}:${text}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey)!;

  try {
    const params: Record<string, string> = {
      q: text,
      langpair: `${sourceLang}|pt-BR`,
    };

    if (process.env.MY_MEMORY_EMAIL) {
      params.de = process.env.MY_MEMORY_EMAIL;
    }

    const res = await axios.get(MYMEMORY_URL, { params });
    const translated: string =
      res.data?.responseData?.translatedText ?? text;

    translationCache.set(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
};

const shouldTranslate = (value: string): boolean => {
  if (!value || value.trim().length < 3) return false;
  if (/^[A-Z0-9.^=-]{1,10}$/.test(value)) return false;   
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return false;      
  if (/^https?:\/\//.test(value)) return false;           
  if (/^\d+(\.\d+)?$/.test(value)) return false;          
  if (value.split(" ").length < 2 && value.length < 15) return false; 
  return true;
};

export const deepTranslate = async <T>(data: T): Promise<T> => {
  if (Array.isArray(data)) {
    const results = await Promise.all(data.map((item) => deepTranslate(item)));
    return results as unknown as T;
  }

  if (data !== null && typeof data === "object") {
    const entries = await Promise.all(
      Object.entries(data as Record<string, unknown>).map(async ([key, val]) => [
        key,
        await deepTranslate(val),
      ])
    );
    return Object.fromEntries(entries) as T;
  }

  if (typeof data === "string" && shouldTranslate(data)) {
    return (await translateText(data)) as unknown as T;
  }

  return data;
};