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

## Diagram flow 
 <img width="876" height="520" alt="Screenshot 2026-09-17 at 9 32 17 PM" src="https://github.com/user-attachments/assets/28842864-3f4d-4a1d-abc6-5a42efa3fbf6" />
<img width="871" height="499" alt="Screenshot 2026-09-17 at 9 34 49 PM" src="https://github.com/user-attachments/assets/55798635-b937-41b3-99e9-45de12bf3629" />
<img width="668" height="499" alt="Screenshot 2026-09-17 at 9 41 38 PM" src="https://github.com/user-attachments/assets/b6f014ba-692e-4362-b1de-ca6d65f789c9" />
<img width="611" height="499" alt="Screenshot 2026-09-17 at 9 35 37 PM" src="https://github.com/user-attachments/assets/ab174ace-6a18-4a6e-a349-5466787695f1" />
<img width="918" height="499" alt="Screenshot 2026-09-17 at 9 34 05 PM" src="https://github.com/user-attachments/assets/cdd7a6e7-840e-436a-939d-605322eb5dd7" />

