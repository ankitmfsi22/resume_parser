import { Router } from 'express';
import mongoose from 'mongoose';
import uploadRoutes from './upload.routes.js';
import { pingRedis } from '../config/redis.js';

const router = Router();

router.get('/health', async (req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;

  let redisOk = false;
  try {
    redisOk = await pingRedis();
  } catch {
    redisOk = false;
  }

  const healthy = mongoOk && redisOk;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    services: {
      api: 'ok',
      mongodb: mongoOk ? 'ok' : 'down',
      redis: redisOk ? 'ok' : 'down',
    },
    uptime: Math.floor(process.uptime()),
  });
});

router.use('/upload', uploadRoutes);

export default router;