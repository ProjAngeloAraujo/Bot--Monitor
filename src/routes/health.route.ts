import { defineRoutes } from '../route';

export default defineRoutes([
  {
    method: 'GET',
    path: '/health',
    handler: async ({ res, services }) => {
      const redisOk = await services.redis.ping().then(() => true).catch(() => false);
      res.status(redisOk ? 200 : 503).json({ status: redisOk ? 'ok' : 'degraded', redis: redisOk });
    },
  },
]);
