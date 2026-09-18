import { Router } from 'express';
import { uploadResumes } from '../middlewares/upload.middleware.js';
import { uploadResumeFiles } from '../controllers/upload.controller.js';

const router = Router();

router.post('/', uploadResumes, uploadResumeFiles);

export default router;