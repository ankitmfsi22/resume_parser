# Resume Parser and Insight Dashboard

Automated resume screening system. Recruiters upload resumes in bulk (PDF, DOCX or scanned
images); the system extracts candidate details, scores each candidate against predefined job
roles,

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js · TypeScript · Express |
| Messaging | RabbitMQ (`amqplib`) |
| Database | MongoDB (Mongoose) |
| Text extraction | `pdf-parse` (PDF) · `mammoth` (DOCX) |
| OCR | Tesseract · Poppler (`pdftoppm`) · `sharp` |
| NLP | `compromise` · `chrono-node` · custom regex and dictionary matching |
| Frontend | React · TypeScript · Vite · Recharts · React Router |
| Testing | Vitest · React Testing Library · Supertest |
| Tooling | ESLint · Prettier · npm workspaces |
| Deployment | Docker · Docker Compose · Docker Swarm · Nginx |

---

## Architecture

Five services, each independently deployable and scalable, communicating only through RabbitMQ
and MongoDB.

| Service | Type | Responsibility |
|---|---|---|
| `api-server` | HTTP (Express) | Uploads, resume list and detail, insights, CSV export |
| `parser-service` | Worker | PDF/DOCX text extraction, OCR routing, NLP, job role matching |
| `ocr-service` | Worker | Tesseract OCR on images and scanned PDFs |
| `insights-worker` | Worker | Summary analytics via MongoDB aggregation |
| `frontend` | React + Nginx | Dashboard UI, and reverse proxy for `/api` |
| `packages/shared` | Library | Database, models and messaging used by every service |

Services never call each other directly. If a worker goes down its messages wait safely in the
queue and are processed the moment it comes back.

---

## Processing Flow

### Normal PDF or DOCX

```
1. POST /api/upload
2. api-server  → validates the file (Multer), saves it, creates a MongoDB
                 document with status "uploaded", publishes to parse-queue,
                 and responds 202 Accepted
3. parser      → extracts text (pdf-parse / mammoth)
4. parser      → runs NLP: name, email, phone, location, skills,
                 experience entries, education entries
5. parser      → scores the candidate against every job role
6. parser      → saves everything, sets status "parsed",
                 publishes to insights-queue
7. insights    → recalculates the dashboard aggregations
```

### Image or scanned PDF

```
3. parser      → image, or a PDF yielding under 50 characters of text
               → sets status "ocr", publishes to ocr-queue
4. ocr-service → images go straight to Tesseract; PDFs are first converted
                 page by page to PNG at 300 DPI with Poppler
               → page texts are combined in the correct order
               → temporary images are deleted in a finally block
5. ocr-service → publishes back to parse-queue, now carrying the text
6. parser      → sees the text already present and skips extraction,
                 then continues from step 4 above
```
---

## Retry and Failure Handling

RabbitMQ has no built-in delayed retry, so it is implemented with TTL queues and a dead-letter
exchange:

```
parse-queue                  attempt fails
     │ publish with x-attempt incremented, ack the original
     ▼
parse-queue.retry.2000       no consumer · TTL 2000ms
     │ message expires → dead-letters back to the work exchange
     ▼
parse-queue                  attempt 2 fails
     ▼
parse-queue.retry.4000       TTL 4000ms
     ▼
parse-queue                  attempt 3 fails — final
     ▼
parse-queue.failed           + MongoDB: status "failed", error, attempts
```

- **3 attempts** total (one original plus two retries), with gaps of **2s** and **4s**
- The attempt counter travels in the `x-attempt` message header
- Each of the three work queues has its own retry and failed queues — **nine queues in total**
- Configured centrally in `packages/shared/src/messaging/`

---

## Project Structure

```
resume_parser/
├── package.json                 npm workspaces root
├── docker-compose.yml           local stack (7 containers)
├── docker-stack.yml             Docker Swarm deployment
├── .env.example
│
├── packages/shared/             @resume-parser/shared
│   └── src/
│       ├── config/db.ts         MongoDB connection
│       ├── models/              Resume, JobRole, Insight schemas
│       ├── messaging/           constants, types, connection, topology,
│       │                        publisher, consumer (retry logic)
│       ├── analytics/           dashboard aggregations
│       └── utils/fileType.ts
│
├── api-server/
│   └── src/
│       ├── config/env.ts        zod-validated environment
│       ├── middlewares/         Multer upload, centralised error handler
│       ├── controllers/         upload, resume, export
│       ├── routes/              route definitions
│       ├── queues/              publishes parse jobs
│       ├── utils/               ApiError, asyncHandler, query builder
│       └── server.ts
│
├── parser-service/
│   └── src/
│       ├── extractors/          pdf-parse and mammoth
│       ├── nlp/                 contact, name, skills, experience, education
│       ├── matching/scorer.ts   weighted keyword scoring
│       ├── data/                skills.json, job-roles.json
│       ├── scripts/             seed-roles.ts
│       ├── routing.ts           OCR routing rules
│       └── workers/parse.worker.ts
│
├── ocr-service/
│   └── src/
│       ├── ocr/                 runCommand, preprocess, pdfToImages,
│       │                        tesseract, orchestrator
│       └── workers/ocr.worker.ts
│
├── insights-worker/
│   └── src/
│       ├── aggregations/
│       └── workers/insights.worker.ts
│
└── frontend/
    ├── nginx.conf               serves the build, proxies /api
    └── src/
        ├── pages/               Upload, ResumeList, ResumeDetail, Dashboard
        ├── components/          Filters, Pagination, StatusBadge,
        │                        ErrorState, EmptyState, Toast, ErrorBoundary
        ├── services/api.ts      the only place that talks to the backend
        └── utils/errors.ts      technical errors → user-facing messages
```

---

## Quick Start

The whole system runs in Docker. Nothing else needs to be installed.

### Prerequisites

- Docker Desktop

### Run

```bash
git clone <repo-url>
cd resume_parser

cp .env.example .env
docker compose up -d
```

The first run builds five images and takes around 6–10 minutes. After that, startup is about
30 seconds.

### Seed the job roles

Matching needs the predefined roles in the database:

```bash
docker compose exec parser-service node dist/scripts/seed-roles.js
```

### Open

| What | URL |
|---|---|
| Dashboard | http://localhost |
| Health check | http://localhost/api/health |
| RabbitMQ management UI | http://localhost:15672 (`resume` / `resume123`) |

### Verify

```bash
docker compose ps        # seven containers, mongo and rabbitmq "(healthy)"
curl http://localhost/api/health
```

### Stop

```bash
docker compose down      # never add -v unless you want to delete all data
```

---

## Local Development

Running the services outside Docker gives a faster edit-and-restart loop.

### Prerequisites

- Node.js 22+
- Docker Desktop (for MongoDB and RabbitMQ only)
- `brew install tesseract poppler` (only if working on the OCR service)

### Setup

```bash
# Infrastructure only
docker compose up -d mongo rabbitmq

# Install every workspace from the root
npm install
npm run build:shared

# Copy the env files
cp api-server/.env.example api-server/.env
cp parser-service/.env.example parser-service/.env
cp ocr-service/.env.example ocr-service/.env
cp insights-worker/.env.example insights-worker/.env
```

The service `.env` files point at `localhost`, because they run outside the Docker network.

### Run (one terminal tab each)

```bash
cd api-server       && npm run dev     # http://localhost:4000
cd parser-service   && npm run dev
cd ocr-service      && npm run dev
cd insights-worker  && npm run dev
cd frontend         && npm run dev     # http://localhost:5173
```

Vite proxies `/api` to `localhost:4000`, so the frontend code calls `/api/...` in development
exactly as it does behind Nginx in production.

### Seed job roles

```bash
cd parser-service && npm run seed:roles
```

> **Note:** after changing anything in `packages/shared`, run `npm run build:shared` from the
> root, or keep `npm run dev:shared` running in a spare tab to rebuild on save.

---

## Docker Swarm

Swarm runs multiple replicas of each service with built-in load balancing. OCR is the slowest
step, so it gets the most replicas.

```bash
# Images must exist first — Swarm does not build them
docker compose build
docker compose down          # free port 80

docker swarm init
docker stack deploy -c docker-stack.yml resume

docker stack services resume
```

### Replica counts

| Service | Replicas | Reason |
|---|---|---|
| `ocr-service` | 3 | Slowest and most CPU-intensive step |
| `api-server` | 2 | Load balancing and availability |
| `parser-service` | 2 | NLP is also CPU-bound |
| `insights-worker` | 1 | Runs occasionally; keeps aggregations serialised |
| `frontend` | 1 | Serves static files |
| `mongo`, `rabbitmq` | 1 | Pinned to the manager node, where their volumes live |

### Scale a worker

```bash
docker service scale resume_ocr-service=5
docker service ps resume_ocr-service
```

New workers start consuming pending messages immediately, because the queue already holds the
backlog. Nothing else in the system has to change.

### Back to Compose

```bash
docker stack rm resume
# wait ~30 seconds for the containers to stop
docker compose up -d
```

Compose and Swarm cannot run at the same time — both want port 80.

---

## API Reference

All endpoints are served under `/api` through Nginx on port 80.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Reports MongoDB and RabbitMQ connectivity; 503 if either is down |
| `POST` | `/api/upload` | Uploads up to 10 resumes; responds `202 Accepted` |
| `GET` | `/api/resumes` | List with filters, sorting and pagination |
| `GET` | `/api/resumes/:id` | A single resume with its full parsed data and raw text |
| `GET` | `/api/insights` | Dashboard analytics |
| `GET` | `/api/export/csv` | CSV export using the same filters as the list |

---

## Testing

```bash
# Backend (api-server, parser-service, ocr-service)
npm test --workspaces --if-present

# Frontend (not part of the workspaces)
cd frontend && npm test

# Type checking and linting
npm run typecheck --workspaces --if-present
npm run lint --workspaces --if-present
```
---

## Developer Notes

### Common commands

```bash
docker compose ps                              # container status
docker compose logs -f parser-service          # follow one service
docker compose restart frontend                # after rebuilding api-server
docker compose up -d --build api-server        # rebuild one service
```

> After rebuilding `api-server`, restart `frontend` as well. Nginx caches the resolved IP at
> startup, so a recreated API container leaves it pointing at a stale address and returns 502.

### Inspecting MongoDB

```bash
# All resumes with name and status
docker compose exec mongo mongosh resume_parser --quiet --eval \
  'db.resumes.find({}, { fileName:1, status:1, "parsed.name":1 }).sort({ createdAt:-1 }).toArray()'

# Count by status
docker compose exec mongo mongosh resume_parser --quiet --eval \
  'db.resumes.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray()'

# Failed resumes with their errors
docker compose exec mongo mongosh resume_parser --quiet --eval \
  'db.resumes.find({ status:"failed" }, { fileName:1, error:1, attempts:1 }).toArray()'

# Full parsed data of the most recent resume
docker compose exec mongo mongosh resume_parser --quiet --eval \
  'printjson(db.resumes.find({status:"parsed"}).sort({updatedAt:-1}).limit(1).next().parsed)'

# Interactive shell
docker compose exec mongo mongosh resume_parser
```

**MongoDB Compass:** connect to `mongodb://localhost:27017` → `resume_parser` → `resumes`.
Useful filters: `{ status: "failed" }`, `{ fileType: "image" }`.

### Inspecting RabbitMQ

The management UI at http://localhost:15672 (`resume` / `resume123`) is the easiest way in.

| Tab | Shows |
|---|---|
| Queues | Message counts. **Ready** = waiting, **Unacked** = being processed |
| Exchanges | Click `resume.work` to see its bindings |
| Get messages | Open a queue to inspect a payload and its headers |

When using **Get messages**, set Ack Mode to *Nack message requeue true*, or the message is
consumed and lost.

```bash
docker compose exec rabbitmq rabbitmqctl list_queues name messages
docker compose exec rabbitmq rabbitmqctl purge_queue parse-queue.failed
```

> Queues normally read as empty because consumers pick messages up within milliseconds. A
> message is only visible while a consumer is down or a retry delay is running. Whether work
> actually completed is answered by MongoDB, not by the queue.

### Reproducing a retry

```bash
docker compose stop parser-service
# upload a PDF from the UI

docker compose exec api-server sh -c 'ls -t /app/uploads | head -1'
docker compose exec api-server rm /app/uploads/<FILE_NAME>

docker compose start parser-service
docker compose logs -f parser-service
```

Three attempts appear with roughly 2s and 4s gaps, the message lands in `parse-queue.failed`,
and the resume is marked `failed` with the error stored on it.

### Cleanup (development only)

```bash
docker compose exec mongo mongosh resume_parser --quiet --eval 'db.resumes.deleteMany({})'
docker compose exec rabbitmq rabbitmqctl purge_queue parse-queue.failed
docker compose exec api-server sh -c 'rm -f /app/uploads/*'
```
---

## Diagram flow 
<img width="754" height="491" alt="Screenshot 2026-09-18 at 8 38 54 PM" src="https://github.com/user-attachments/assets/0c4ecea3-ee4e-49c8-85f8-072c0aae68d7" />
 <img width="876" height="520" alt="Screenshot 2026-09-17 at 9 32 17 PM" src="https://github.com/user-attachments/assets/28842864-3f4d-4a1d-abc6-5a42efa3fbf6" />
<img width="871" height="499" alt="Screenshot 2026-09-17 at 9 34 49 PM" src="https://github.com/user-attachments/assets/55798635-b937-41b3-99e9-45de12bf3629" />
<img width="611" height="499" alt="Screenshot 2026-09-17 at 9 35 37 PM" src="https://github.com/user-attachments/assets/ab174ace-6a18-4a6e-a349-5466787695f1" />
<img width="918" height="499" alt="Screenshot 2026-09-17 at 9 34 05 PM" src="https://github.com/user-attachments/assets/cdd7a6e7-840e-436a-939d-605322eb5dd7" />

