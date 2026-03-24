# 🚀 AI-Powered Resume Analyzer with Real-Time Job Matching

A full-stack web application that parses your resume, scores it using ATS metrics, matches it with real jobs using NLP/AI, and lets you apply directly — all from a modern dashboard.

---

## 📸 Features

| Feature | Description |
|---|---|
| 📄 Resume Parsing | Upload PDF/DOCX — extracts name, email, phone, skills, education, experience, projects |
| 📊 ATS Scoring | Score out of 100 with improvement suggestions |
| 💼 Job Matching | TF-IDF cosine similarity matching with match % per job |
| 🗺️ Nearby Jobs | Filter by city or browser geolocation |
| 🌍 Remote Jobs | Dedicated remote-only job feed |
| 🤖 AI Assistant | Chat assistant powered by your resume + job data |
| ✅ Apply Tracking | One-click apply with application history |
| 🔖 Save Jobs | Bookmark jobs for later |
| 🔐 JWT Auth | Secure register/login with JWT tokens |

---

## 🗂️ Folder Structure

```
resume-analyzer/
├── backend/
│   ├── app.py                  # Flask app factory
│   ├── requirements.txt
│   ├── .env.example
│   ├── data/
│   │   └── sample_jobs.json    # 25 realistic sample jobs
│   ├── routes/
│   │   ├── auth.py             # POST /api/auth/register|login
│   │   ├── resume.py           # POST /api/resume/upload, GET /api/resume/me
│   │   ├── jobs.py             # GET /api/jobs/recommended|nearby|remote|all
│   │   ├── analysis.py         # GET /api/analysis/score
│   │   └── assistant.py        # POST /api/assistant/query
│   ├── services/
│   │   ├── resume_parser.py    # PDF + DOCX parsing
│   │   ├── matching.py         # TF-IDF cosine similarity
│   │   ├── analysis.py         # ATS scoring
│   │   ├── job_adapter.py      # Mock + Adzuna + Jooble adapters
│   │   └── assistant.py        # Rule-based AI assistant
│   └── utils/
│       ├── db.py               # MongoDB connection
│       └── auth_helpers.py     # bcrypt helpers
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── services/
│       │   └── api.js          # Axios instance with JWT interceptors
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── UploadPage.jsx
│           └── DashboardPage.jsx
│
└── README.md
```

---

## ⚙️ Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (local or [Atlas free tier](https://www.mongodb.com/atlas))
- **VS Code** (recommended)

---

## 🛠️ Setup & Run (Windows)

### 1. Clone / open the project
```bash
cd resume-analyzer
```

### 2. Backend setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env
# → Edit .env and set your MONGO_URI

# Run Flask server
python app.py
# → Runs on http://localhost:5000
```

### 3. Frontend setup (new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Copy env file
copy .env.example .env

# Start dev server
npm run dev
# → Runs on http://localhost:5173
```

### 4. Open in browser
Navigate to **http://localhost:5173**

---

## 🍃 MongoDB Setup

**Option A — Local MongoDB**
1. Download from https://www.mongodb.com/try/download/community
2. Install and start the service
3. Set `MONGO_URI=mongodb://localhost:27017` in `backend/.env`

**Option B — MongoDB Atlas (free, no install)**
1. Create free account at https://cloud.mongodb.com
2. Create a free M0 cluster
3. Get connection string and set in `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net
   ```

---

## 🔑 Adding Real Job APIs

The app uses mock data by default. To switch to real APIs:

### Adzuna (recommended, free tier)
1. Register at https://developer.adzuna.com
2. Get App ID and API Key
3. In `backend/.env`:
   ```
   JOB_PROVIDER=adzuna
   ADZUNA_APP_ID=your_app_id
   ADZUNA_API_KEY=your_api_key
   ```

### Jooble
1. Register at https://jooble.org/api/about
2. In `backend/.env`:
   ```
   JOB_PROVIDER=jooble
   JOOBLE_API_KEY=your_key
   ```

### RapidAPI (any job board)
- Add your own adapter in `backend/services/job_adapter.py`
- Set `RAPIDAPI_KEY=` in `.env`

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| POST | `/api/resume/upload` | ✅ | Upload PDF/DOCX |
| GET  | `/api/resume/me` | ✅ | Get parsed resume |
| GET  | `/api/resume/export` | ✅ | Download resume as JSON |
| GET  | `/api/jobs/recommended` | ✅ | Resume-matched jobs |
| GET  | `/api/jobs/nearby?location=Bhubaneswar` | ✅ | City-filtered jobs |
| GET  | `/api/jobs/remote` | ✅ | Remote-only jobs |
| GET  | `/api/jobs/all` | ✅ | All jobs with filters |
| POST | `/api/jobs/apply` | ✅ | Record application |
| GET  | `/api/jobs/applied` | ✅ | Get applied jobs |
| POST | `/api/jobs/save` | ✅ | Toggle save job |
| GET  | `/api/analysis/score` | ✅ | Get ATS analysis |
| POST | `/api/assistant/query` | ✅ | Ask AI assistant |
| GET  | `/api/health` | ❌ | Health check |

---

## 🤖 AI Assistant Queries

Try asking:
- *"What jobs fit my resume?"*
- *"Which skills am I missing?"*
- *"Show remote AI jobs"*
- *"What's my ATS score?"*
- *"What skills do I have?"*

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python Flask + Blueprints |
| Database | MongoDB (PyMongo) |
| Auth | JWT (flask-jwt-extended) |
| Resume Parsing | pdfplumber + python-docx |
| NLP Matching | scikit-learn TF-IDF + cosine similarity |
| File Upload | react-dropzone |
| Notifications | react-hot-toast |
| Icons | lucide-react |

---

## 🎓 Suitable For

- ✅ AD Lab / Mini Project submission
- ✅ Viva demonstration
- ✅ Resume / portfolio showcase
- ✅ Placement demo project
- ✅ Hackathon starter

---

## 📝 Extending the Project

| Extension | How |
|---|---|
| Add GPT/Gemini to assistant | Replace `get_answer()` in `services/assistant.py` with OpenAI/Google API call |
| Real job APIs | Set `JOB_PROVIDER` in `.env`, keys already stubbed |
| Email notifications | Add Flask-Mail and send on apply |
| Resume builder | Add a new page with jinja/PDF templates |
| Dark/light toggle | Add ThemeContext, switch `dark` class on `<html>` |
| Deploy backend | Use Railway, Render, or Heroku |
| Deploy frontend | Use Vercel (connect GitHub repo) |
