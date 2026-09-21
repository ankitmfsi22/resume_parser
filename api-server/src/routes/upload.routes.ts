import { Router } from 'express';
import { uploadResumeFiles } from '../controllers/upload.controller';
import { uploadResumes } from '../middlewares/upload.middleware';

const router = Router();

router.post('/', uploadResumes, uploadResumeFiles);

export default router;
