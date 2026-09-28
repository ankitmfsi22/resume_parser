import { Router } from 'express';
import { isMongoConnected, isRabbitConnected } from '@resume-parser/shared';
import { getInsights, getResume, listResumes } from '../controllers/resume.controller';
import { exportResumesCsv } from '../controllers/export.controller';
import uploadRoutes from './upload.routes';

const router = Router();

router.get('/health', (_req, res) => {
  const mongoOk = isMongoConnected();
  const rabbitOk = isRabbitConnected();
  const healthy = mongoOk && rabbitOk;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    services: {
      api: 'ok',
      mongodb: mongoOk ? 'ok' : 'down',
      rabbitmq: rabbitOk ? 'ok' : 'down',
    },
    uptime: Math.floor(process.uptime()),
  });
});

router.use('/upload', uploadRoutes);

router.get('/resumes', listResumes);
router.get('/resumes/:id', getResume);
router.get('/insights', getInsights);
router.get('/export/csv', exportResumesCsv);

export default router;