import 'dotenv/config';
import express from 'express';
import { RedisService } from './modules/redis/redis.service';
import { TelegramService } from './modules/telegram/telegram.service';
import { createRouter, errorHandler, notFoundHandler } from './route';

const PORT = Number(process.env.PORT ?? 3000);

const redis = new RedisService();
const telegram = new TelegramService();

async function bootstrap() {
  await redis.connect();
  console.log('[redis] conectado');

  await telegram.connect();
  console.log('[telegram] conectado');

  const app = express();
  app.use(express.json());
  app.use('/api/v1', createRouter({ redis, telegram }));
  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = app.listen(PORT, () => console.log(`[http] ouvindo na porta ${PORT}`));

  const shutdown = async (signal: string) => {
    console.log(`[app] ${signal} recebido, encerrando...`);
    server.close();
    await Promise.allSettled([telegram.disconnect(), redis.disconnect()]);
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[app] falha ao iniciar:', err);
  process.exit(1);
});
