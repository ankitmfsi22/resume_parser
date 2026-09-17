# Resume Parser and Insight Dashboard

Automated system that parses resumes (PDF/DOCX/images), extracts candidate details,
matches them to job roles, and shows hiring insights on a dashboard.

## Tech Stack
Node.js · Express · BullMQ · Redis · MongoDB · Tesseract · compromise · chrono-node · React · Recharts · Docker Swarm

## Project Structure
| Folder | Purpose |
|---|---|
| `api` | Upload, resumes, insights, CSV export |
| `parser-service` | Text extraction, NLP, job matching |
| `ocr-service` | Tesseract OCR |
| `insights-worker` | Summary analytics |
| `frontend` | React dashboard |
| `docs` | Plan and architecture |

## Run Locally
```bash
cp .env.example .env
docker compose up -d
docker compose ps
```

## Documentation
