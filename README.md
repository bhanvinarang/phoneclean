# 📱 PhoneClean — Indian Phone Number Cleaning Dashboard

## Folder Structure (after unzip)
```
phoneclean/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── utils/
        │   └── api.js
        └── components/
            ├── FileUploader.jsx
            ├── ColumnSelector.jsx
            ├── CleaningOptions.jsx
            ├── PreviewTable.jsx
            ├── MetricsDashboard.jsx
            ├── Stepper.jsx
            └── Toast.jsx
```

---

## ⚡ Quick Start

### Step 1 — Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# macOS / Linux:
source venv/bin/activate
# Windows (Command Prompt):
venv\Scripts\activate.bat
# Windows (PowerShell):
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend live at: http://localhost:8000
Swagger docs at: http://localhost:8000/docs

---

### Step 2 — Frontend

Open a NEW terminal (keep backend running):

```bash
cd frontend

# Install dependencies
npm install

# Copy env file (no changes needed for local dev)
cp .env.example .env.local

# Start dev server
npm run dev
```

App live at: http://localhost:5173

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /upload | Upload .xlsx or .csv file |
| POST | /clean | Clean data with options |
| GET | /download/{session_id} | Download cleaned Excel |
| GET | /report/{session_id} | Download text report |

---

## Deploy to Production

### Backend → Render.com
1. Push `backend/` folder to GitHub
2. New Web Service on render.com
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`

### Frontend → Vercel
```bash
cd frontend
npm run build
npx vercel
```
Set env var: `VITE_API_URL=https://your-backend.onrender.com`

### Frontend → Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Env var: `VITE_API_URL=https://your-backend.onrender.com`
