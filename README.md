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

### Prerequisites
- Node.js 20+
- Docker Desktop

### 1. Start MongoDB and Redis
```bash
cp .env.example .env
docker compose up -d
docker compose ps        # both containers should be (healthy)
```

### 2. Start API (Terminal 1)
```bash
cd api-server
cp .env.example .env
npm install
npm run dev
```
API runs on http://localhost:4000 — health check: `GET /api/health`

### 3. Start Parser Service (Terminal 2)
```bash
cd parser-service
cp .env.example .env
npm install
npm run dev
```

### 4. Upload a resume
```bash
curl -X POST http://localhost:4000/api/upload \
  -F "resumes=@/path/to/resume.pdf"
```
Or in Postman: `POST /api/upload` → Body → form-data → key `resumes` (type File).

### Useful Scripts (api-server and parser-service)
| Script | Purpose |
|---|---|
| `npm run dev` | Start in watch mode |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Diagram flow 
<img width="754" height="491" alt="Screenshot 2026-09-18 at 8 38 54 PM" src="https://github.com/user-attachments/assets/0c4ecea3-ee4e-49c8-85f8-072c0aae68d7" />
 <img width="876" height="520" alt="Screenshot 2026-09-17 at 9 32 17 PM" src="https://github.com/user-attachments/assets/28842864-3f4d-4a1d-abc6-5a42efa3fbf6" />
<img width="871" height="499" alt="Screenshot 2026-09-17 at 9 34 49 PM" src="https://github.com/user-attachments/assets/55798635-b937-41b3-99e9-45de12bf3629" />
<img width="611" height="499" alt="Screenshot 2026-09-17 at 9 35 37 PM" src="https://github.com/user-attachments/assets/ab174ace-6a18-4a6e-a349-5466787695f1" />
<img width="918" height="499" alt="Screenshot 2026-09-17 at 9 34 05 PM" src="https://github.com/user-attachments/assets/cdd7a6e7-840e-436a-939d-605322eb5dd7" />

---

## 🛠️ Dev Notes (Quick Reference)

### Where things run

| Component | Where | Address |
|---|---|---|
| MongoDB | Docker container `rp-mongo` | `localhost:27017`, DB: `resume_parser` |
| Redis | Docker container `rp-redis` | `localhost:6379` |
| API | Local (`npm run dev` in `api-server`) | `http://localhost:4000` |
| Parser Service | Local (`npm run dev` in `parser-service`) | No port, listens to `parse-queue` |

- Docker config: `docker-compose.yml` (project root)
- Services connect via `.env` → `MONGO_URI` / `REDIS_URL` → `config/db.ts` / `config/redis.ts`

---

### Daily startup (3 terminal tabs)

```bash
# Tab 1 — from project root
docker compose up -d
docker compose ps              # both should be (healthy)

# Tab 2
cd api-server && npm run dev

# Tab 3
cd parser-service && npm run dev
```

Stop everything:
```bash
# Ctrl + C in Tab 2 and Tab 3, then:
docker compose down            # never use -v unless you want to delete all data
```

---

### Docker commands

```bash
docker compose ps                    # container status
docker compose logs mongo            # Mongo logs
docker compose logs redis            # Redis logs
docker compose restart mongo         # restart one container
docker port rp-mongo                 # check exposed port
```

---

### MongoDB — view data

**Terminal (one-liners):**
```bash
# All resumes (name + status)
docker exec -it rp-mongo mongosh resume_parser --quiet --eval 'db.resumes.find({}, { fileName: 1, status: 1, attempts: 1 }).sort({ createdAt: -1 }).toArray()'

# Count by status
docker exec -it rp-mongo mongosh resume_parser --quiet --eval 'db.resumes.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray()'

# Failed resumes with error
docker exec -it rp-mongo mongosh resume_parser --quiet --eval 'db.resumes.find({ status: "failed" }, { fileName: 1, error: 1, attempts: 1 }).toArray()'

# One resume by id
docker exec -it rp-mongo mongosh resume_parser --quiet --eval 'printjson(db.resumes.findOne({ _id: ObjectId("PASTE_ID_HERE") }))'

# First 500 chars of extracted text (latest parsed)
docker exec -it rp-mongo mongosh resume_parser --quiet --eval 'print(db.resumes.find({ status: "parsed" }).sort({ updatedAt: -1 }).limit(1).next().rawText.slice(0, 500))'

# Indexes
docker exec -it rp-mongo mongosh resume_parser --quiet --eval 'db.resumes.getIndexes().forEach(i => print(i.name))'
```

**Interactive shell:**
```bash
docker exec -it rp-mongo mongosh resume_parser
```
```js
db.resumes.find()
db.resumes.find({ status: "parsed" })
db.resumes.countDocuments()
exit
```

**GUI — MongoDB Compass:** connect to `mongodb://localhost:27017` → `resume_parser` → `resumes`
Filter examples: `{ status: "failed" }`, `{ fileType: "pdf" }`

**Docker Desktop:** Containers → `rp-mongo` → **Exec** tab → `mongosh resume_parser`

---

### Redis / BullMQ — view queue data

**Terminal:**
```bash
# All BullMQ keys
docker exec -it rp-redis redis-cli KEYS "bull:*"

# Job IDs by state
docker exec -it rp-redis redis-cli ZRANGE bull:parse-queue:completed 0 -1
docker exec -it rp-redis redis-cli ZRANGE bull:parse-queue:failed 0 -1
docker exec -it rp-redis redis-cli LRANGE bull:parse-queue:wait 0 -1
docker exec -it rp-redis redis-cli ZRANGE bull:parse-queue:delayed 0 -1    # waiting for retry

# Full details of one job
docker exec -it rp-redis redis-cli HGETALL bull:parse-queue:JOB_ID
```

**Job hash fields (BullMQ stores short names):**

| Field | Meaning |
|---|---|
| `data` | Job payload (`resumeId`, `filePath`, `fileType`) |
| `opts` | Job options (`attempts`, `backoff`) |
| `atm` | Attempts made |
| `failedReason` | Last error message |
| `returnvalue` | Worker result on success |

**Interactive shell:**
```bash
docker exec -it rp-redis redis-cli
KEYS bull:*
exit
```

**GUI — RedisInsight:** add database `localhost:6379`
**Docker Desktop:** Containers → `rp-redis` → **Exec** tab → `redis-cli`

---

### API testing

**Health:**
```bash
curl http://localhost:4000/api/health
```

**Upload (curl):**
```bash
curl -X POST http://localhost:4000/api/upload \
  -F "resumes=@/path/to/resume.pdf" \
  -F "resumes=@/path/to/resume.docx"
```

**Upload (Postman desktop app):**
`POST http://localhost:4000/api/upload` → Body → form-data → key `resumes` → change type **Text → File** → Select Files → Send
Expected: `202 Accepted`

**Expected errors:**

| Case | Expected |
|---|---|
| `.txt` file | `400 Unsupported file` |
| Key name not `resumes` | `400 Unexpected field` |
| No file | `400 No files uploaded` |
| File > 10 MB | `400 File too large` |
| Wrong route | `404 Route not found` |

---

### Retry test (exponential backoff)

1. Stop parser (Tab 3: `Ctrl + C`)
2. Upload a PDF → `202`
3. Delete that file:
```bash
   cd api-server/uploads
   ls -t | head -1          # latest file name
   rm <FILE_NAME>
   cd ../..
```
4. Start parser → watch logs: 3 attempts, gaps ~2s then ~4s
5. Check DB: `status: "failed"`, `error`, `attempts: 3`

Retry config: `attempts: 3`, exponential backoff `2000ms` → gaps 2s, 4s
Defined in `api-server/src/queues/index.ts` and `parser-service/src/queues/index.ts`

---

### Cleanup (dev only)

```bash
# Delete all resumes from DB
docker exec -it rp-mongo mongosh resume_parser --quiet --eval 'db.resumes.deleteMany({})'

# Clear all BullMQ queue data from Redis
docker exec -it rp-redis redis-cli --scan --pattern "bull:*" | xargs docker exec -i rp-redis redis-cli DEL

# Delete uploaded files
rm -f api-server/uploads/*

# Nuclear option: delete containers AND all data (volumes)
docker compose down -v
```

---

### Troubleshooting

| Problem | Fix |
|---|---|
| `Invalid environment variables` on start | Compare `.env` with `.env.example`, fix listed keys |
| `MongoDB connection failed` | `docker compose ps` → if not running, `docker compose up -d` |
| Container shows `(health: starting)` | Wait 15–20s, check again |
| Port already in use (4000 / 27017 / 6379) | `lsof -i :4000` → `kill -9 <PID>` |
| Upload OK but parser shows nothing | Parser not running, or wrong `REDIS_URL` in `parser-service/.env` |
| `ENOENT: no such file or directory` | File missing in `api-server/uploads` (or path mismatch) |
| Image resume fails | Expected until OCR service is implemented |

