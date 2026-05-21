import app from "./app.js";
import dotenv from 'dotenv'
dotenv.config()
import { connectRedis } from "./config/redis.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
};

start();