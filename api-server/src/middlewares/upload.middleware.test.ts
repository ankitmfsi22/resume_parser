import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { errorHandler } from './error.middleware';
import { uploadResumes } from './upload.middleware';

function buildTestApp() {
  const app = express();

  app.post('/upload', uploadResumes, (_req, res) => {
    res.status(202).json({ success: true });
  });

  app.use(errorHandler);
  return app;
}

describe('upload middleware', () => {
  const app = buildTestApp();

  it('rejects an unsupported file type', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('resumes', Buffer.from('plain text'), 'notes.txt');

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/unsupported file/i);
  });

  it('rejects a file sent under the wrong field name', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('files', Buffer.from('%PDF-1.4'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/unexpected field/i);
  });

  it('accepts a PDF sent under the correct field name', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('resumes', Buffer.from('%PDF-1.4'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });

    expect(response.status).toBe(202);
  });
});