# GradeFlow AI

AI-powered handwritten assignment grader — built for a 2.5-hour hackathon.

**Stack**: React (Vite) · FastAPI · Supabase (Postgres + Storage) · Qwen VL · Gemma

---

## Quick start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in SUPABASE_URL and SUPABASE_SERVICE_KEY
uvicorn app.main:app --reload --port 8000
```

Health check: <http://localhost:8000/health>  
API docs: <http://localhost:8000/docs>

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at: <http://localhost:5173>

---

## Project layout

```
GradeFlow-AI/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app + CORS
│   │   ├── db.py          # Supabase helpers
│   │   ├── models.py      # Pydantic models
│   │   └── config.py      # pydantic-settings
│   ├── scripts/
│   │   └── check_db.py    # DB smoke test
│   └── requirements.txt
├── frontend/              # Vite + React
├── shared/
│   └── api-contract.md    # Planned JSON shapes
└── db/
    └── schema.sql         # Supabase schema
```

---

## API contract

See [`shared/api-contract.md`](shared/api-contract.md) for planned request/response shapes.