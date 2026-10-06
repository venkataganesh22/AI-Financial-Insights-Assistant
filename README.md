# AI-Powered Financial Insights Assistant

An educational, web-based personal finance assistant tailored for **Indian students, young professionals, and salaried individuals**. The application analyzes personal CSV transaction data, clusters spending habits using **KMeans**, detects potential overspending anomalies via a **Machine Learning Classifier**, and answers personal finance questions through a **Retrieval-Augmented Generation (RAG)** chatbot with an Indian financial focus.

> **Disclaimer:** This application provides educational financial insights and is NOT a substitute for professional financial advice.

---

## 🌟 Key Features

1. **User Authentication & Data Isolation:**
   - Account registration and login with password hashing (`PBKDF2 HMAC SHA256`).
   - Isolated user directories (`backend/app/data/transactions/<user_email>/`) ensuring data privacy.
   - Pre-seeded **DEMO accounts** with sample Indian transaction data.

2. **Smart CSV Transaction Upload:**
   - Tolerant column mapping (`date`, `description`/`merchant`, `category`, `amount`, `type`).
   - Automatic data cleaning, date parsing, and type standardization (Income vs Expense).

3. **Financial Dashboard & Visual Analytics:**
   - Formatted in **Indian Rupee (₹ INR)**.
   - Key Metrics: Total Income, Total Expenses, Net Savings, Savings Rate (%), Largest Category, Average Monthly Spending.
   - Interactive charts for Category Spending Breakdown and Monthly Income vs. Expenses.

4. **Machine Learning Spending Clustering (KMeans):**
   - Clusters spending patterns into data-driven personas using `scikit-learn`:
     - **Essential Spender** (High Rent/Bills ratio)
     - **Shopping Heavy** (High discretionary retail spend)
     - **Food & Entertainment Heavy** (High Swiggy/Zomato/Outing spend)
     - **Balanced Spender** (Well-distributed expenses)

5. **ML Overspending Anomaly Detection:**
   - Trains a `DecisionTreeClassifier` on synthetic category spending thresholds to flag unusually large expense transactions and explain the deviation.

6. **ChatGPT / Gemini Style RAG Assistant:**
   - Query Router automatically classifies questions:
     - `PERSONAL_TRANSACTION_QUERY` → Pandas + ML transaction analysis engine.
     - `GENERAL_FINANCE_QUERY` → RAG Engine retrieving from educational finance documents (`personal_finance_basics.txt`, `budgeting.txt`, `indian_tax_basics.txt`, `emergency_fund.txt`).
   - Generates answers via Google Gemini API (or structured educational fallback when offline).
   - Displays sources cited (e.g., *Sources used: Emergency Fund Guide*).

---

## 🛠️ Tech Stack

- **Frontend:** React, JavaScript, HTML5, Vanilla CSS (Dark ChatGPT/Gemini Theme), Recharts, Lucide Icons, Vite
- **Backend:** Python 3.13, FastAPI, Pydantic, Uvicorn
- **Data & Machine Learning:** pandas, NumPy, scikit-learn (KMeans, DecisionTreeClassifier)
- **AI & RAG:** TF-IDF Cosine Vector Store, Document Loader, Google Gemini API
- **Authentication:** JWT, PBKDF2 Password Hashing
- **Storage:** Local CSV & JSON storage
- **Deployment Target:** Render ONLY

---

## 📁 Project Architecture & Folder Structure

```
financial-insights-assistant/
│
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI main app & CORS configuration
│   │   ├── config.py              # App config & environment variables
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.py            # Password hashing & JWT token logic
│   │   │   └── users.json         # JSON user database (pre-seeded demo users)
│   │   │
│   │   ├── api/
│   │   │   ├── auth.py            # POST /auth/login, POST /auth/register
│   │   │   ├── upload.py          # POST /upload
│   │   │   ├── analyze.py         # GET /analyze, GET /dashboard
│   │   │   └── chat.py            # POST /chat
│   │   │
│   │   ├── ml/
│   │   │   ├── clustering.py      # KMeans spending behavior clustering
│   │   │   ├── overspending.py    # DecisionTree overspending detector
│   │   │   └── analysis.py        # Insights synthesis generator
│   │   │
│   │   ├── rag/
│   │   │   ├── document_loader.py # Loads & splits .txt finance guides
│   │   │   ├── vector_store.py    # In-memory TF-IDF vector index
│   │   │   └── rag_pipeline.py    # RAG pipeline with Gemini API integration
│   │   │
│   │   ├── services/
│   │   │   ├── transaction_service.py # Pandas dataset cleaning & metrics
│   │   │   └── chatbot_service.py     # Query Router & Chat orchestrator
│   │   │
│   │   └── data/
│   │       ├── transactions/      # User-isolated CSV folders
│   │       └── documents/         # RAG knowledge files
│   │
│   ├── tests/
│   │   └── test_backend.py        # Pytest test suite for auth, ML, RAG
│   │
│   ├── requirements.txt           # Python backend dependencies
│   └── run.py                     # Entrypoint script
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx           # ChatGPT style chat container
│   │   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   │   ├── Message.jsx        # Chat message bubble & sources badge
│   │   │   ├── Dashboard.jsx      # Financial metrics & insights view
│   │   │   ├── UploadCSV.jsx      # CSV drag-and-drop uploader
│   │   │   ├── Charts.jsx         # Recharts pie & bar components
│   │   │   └── Navbar.jsx         # Header & disclaimer banner
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Dark login card with demo buttons
│   │   │   ├── Register.jsx       # Account registration page
│   │   │   └── Home.jsx           # Main layout page
│   │   │
│   │   ├── App.jsx                # State routing & auth persistence
│   │   ├── main.jsx               # React DOM root
│   │   └── styles.css             # ChatGPT dark design tokens
│   │
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js             # Vite dev server configuration
│
├── sample_data/
│   └── transactions.csv           # 50+ realistic Indian sample transactions
│
├── documents/
│   ├── personal_finance_basics.txt
│   ├── budgeting.txt
│   ├── indian_tax_basics.txt
│   └── emergency_fund.txt
│
├── README.md                      # Documentation & deployment guide
└── .gitignore                     # Git exclusion rules
```

---

## 🔑 Pre-seeded DEMO Credentials

For easy testing without registering a new account, use these **DEMO ONLY** accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **User 1 (Student)** | `student@example.com` | `Student@123` |
| **User 2 (Rahul)** | `rahul@example.com` | `Rahul@123` |
| **User 3 (Priya)** | `priya@example.com` | `Priya@123` |

---

## 📊 CSV File Format

Expected CSV headers (flexible matching supports lowercase / uppercase variations):

```csv
date,description,category,amount,type
2026-01-01,Monthly Salary from Tech Corp,Salary,75000,income
2026-01-02,House Rent Payment,Rent,15000,expense
2026-01-04,Swiggy Lunch Order,Food,450,expense
2026-01-07,Uber Auto to Office,Transport,180,expense
2026-01-10,Amazon India Shopping,Shopping,3200,expense
```

---

## ⚙️ Environment Variables

Create `.env` file in the root directory:

```env
# Free Google Gemini API Key (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Secret key for JWT signing
SECRET_KEY=finance-insights-super-secret-key-2026

# Frontend API URL (for local dev)
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Local Installation & Setup

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run pytest unit tests
pytest tests/test_backend.py

# Run FastAPI server
python run.py
# Server will start on http://localhost:8000
```

### 2. Frontend Setup (React + Vite)

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
# Frontend will run on http://localhost:3000
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticates user & returns JWT token |
| `POST` | `/auth/register` | Registers new user with hashed password |
| `POST` | `/upload` | Uploads and processes user transaction CSV |
| `POST` | `/chat` | Main chatbot endpoint (Transaction query or RAG) |
| `GET` | `/dashboard` | Summary dashboard metrics in ₹ INR |
| `GET` | `/analyze` | Complete ML insights (KMeans cluster + overspending) |
| `GET` | `/health` | Health check endpoint for Render monitoring |

---

## 🚀 Render Deployment Guide (Render ONLY)

Follow these exact steps to deploy the application on **Render**:

### Single Web Service Deployment (Backend + Serving Built React Frontend)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit of AI Financial Insights Assistant"
   git remote add origin https://github.com/your-username/financial-insights-assistant.git
   git push -u origin main
   ```

2. **Build Frontend Bundle (Local or CI):**
   ```bash
   cd frontend
   npm run build
   # This creates frontend/dist directory which FastAPI automatically serves!
   ```

3. **Log into Render:**
   - Go to [render.com](https://render.com) and create a free account.

4. **Create a New Web Service:**
   - Click **New +** → **Web Service**.
   - Connect your GitHub repository.

5. **Configure Web Service Settings:**
   - **Name:** `ai-financial-assistant`
   - **Environment:** `Python 3`
   - **Region:** Choose nearest region (e.g. Singapore / Frankfurt).
   - **Branch:** `main`
   - **Root Directory:** Leave blank (or set to `backend` if deploying separate services).
   - **Build Command:**
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

6. **Add Environment Variables in Render Dashboard:**
   - `GEMINI_API_KEY`: `your_actual_gemini_api_key`
   - `SECRET_KEY`: `your_random_secret_string`
   - `PYTHON_VERSION`: `3.13.2`

7. **Deploy & Verify:**
   - Click **Create Web Service**.
   - Once deployed, visit `https://your-service-name.onrender.com/health` to verify status.
   - Access the live application URL directly in your browser.

---

## ⚠️ Render Ephemeral Storage Notice

> **Notice:** Render's free Web Service instance filesystem is ephemeral. File modifications or user uploads stored locally in `backend/app/data/transactions/` will reset upon application restart or re-deployment.
> For production commercial applications, persistent cloud databases (e.g., PostgreSQL / AWS S3) should be integrated. For portfolio and educational demo purposes, local file storage is used.

---

## 📝 Resume Bullet Point Example

> **AI-Powered Personal Financial Insights Assistant** | *FastAPI, React, scikit-learn, LangChain, pandas, RAG*
> - Designed and built a full-stack personal finance platform enabling Indian users to upload CSV transactions and discover spending habits via KMeans clustering and ML decision tree overspending detection.
> - Implemented a hybrid Chatbot Query Router with a LangChain TF-IDF RAG pipeline and Google Gemini API to answer Indian personal finance queries with cited sources.
> - Architected user authentication, password security (PBKDF2 HMAC), isolated file storage, and dark UI responsive dashboard deployed on Render.
