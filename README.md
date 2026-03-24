# TrendHawk v2

A rebuilt version of TrendHawk with **React (Vite) frontend** + **FastAPI (Python) backend**.

## Project Structure

```
TrendHawk-v2/
├── backend/          # FastAPI Python backend
│   ├── main.py       # All API routes
│   ├── scrapers/     # eBay, Etsy scrapers (Python)
│   ├── lib/          # plans, usage, proxy, supabase
│   ├── requirements.txt
│   ├── setup.bat     # One-time setup
│   └── start.bat     # Start backend
└── frontend/         # React + Vite frontend
    ├── src/
    │   ├── pages/    # All dashboard pages
    │   ├── layouts/  # DashboardLayout
    │   ├── context/  # AuthContext
    │   └── lib/      # api.js, supabase.js
    └── package.json
```

## Setup & Running

### 1. Backend (FastAPI) — Run First
```bash
cd backend
setup.bat          # First time: creates venv + installs packages
start.bat          # Start the API server on http://localhost:8000
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev        # Runs on http://localhost:5173
```

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/scrape` | Scrape eBay or Etsy product |
| POST | `/api/search` | Search by keyword |
| GET | `/api/usage` | Get user credits |
| GET | `/api/tracked` | Get tracked products |
| POST | `/api/tracked` | Add tracked product |
| DELETE | `/api/tracked/{id}` | Remove tracked product |
| GET/POST/DELETE | `/api/alerts` | Price alerts |
| GET | `/api/trending` | Trending products |
| GET | `/api/admin/users` | Admin: list users |

## Environment Variables

### Backend (.env)
```
PROXY_HOST=gate.decodo.com
PROXY_PORT=10001
PROXY_USER=...
PROXY_PASS=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Frontend (.env)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=http://localhost:8000
```
