<div align="center">

# 💹 AI-Powered Financial Insights Assistant

**A full-stack personal finance platform for Indian users: upload your transactions, discover your spending personality with ML, and ask finance questions through a RAG-powered chatbot.**


[Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference)

</div>

> **Disclaimer:** This project is for educational purposes only and is **not** a substitute for professional financial advice.

---

## 📖 Overview

Most budgeting tools are built for Western users and ignore Indian context: UPI payments, Swiggy/Zomato spending, rent-heavy budgets, 80C deductions, and the old vs. new tax regime. This project addresses that gap.

Users upload a CSV of their transactions and get:

- A **dashboard** of key financial metrics in ₹ INR
- An **ML-driven spending persona** (via KMeans clustering)
- **Overspending alerts** on unusual transactions (via a Decision Tree classifier)
- A **chatbot** that answers both personal-data questions and general Indian personal finance questions, with cited sources

---

## ✨ Features

### 🔐 Authentication & Data Isolation
- Registration and login with **PBKDF2-HMAC-SHA256** password hashing and **JWT** sessions
- Per-user storage directories (`backend/app/data/transactions/<user_email>/`) so users never see each other's data
- Pre-seeded demo accounts with realistic Indian transaction data

### 📤 Smart CSV Upload
- Tolerant column mapping (`date`, `description`/`merchant`, `category`, `amount`, `type`), case-insensitive
- Automatic cleaning: date parsing, type normalisation (income vs. expense), and invalid row handling

### 📊 Financial Dashboard
- Total income, total expenses, net savings, savings rate, largest spending category, average monthly spend
- Interactive Recharts visualisations: category breakdown and monthly income vs. expenses

### 🧠 ML Spending Clustering (KMeans)
Groups spending patterns into interpretable personas:

| Persona | Signal |
| :--- | :--- |
| **Essential Spender** | High share of rent and bills |
| **Shopping Heavy** | High discretionary retail spend |
| **Food & Entertainment Heavy** | High Swiggy/Zomato/outings spend |
| **Balanced Spender** | Evenly distributed expenses |

### 🚨 Overspending Detection (Decision Tree)
A `DecisionTreeClassifier`, trained on synthetic per-category spending thresholds, flags unusually large expense transactions and explains how far they deviate from the expected range.

### 🤖 Hybrid RAG Chatbot
A **query router** classifies each question and sends it to the right engine:

| Route | Handled by | Example |
| :--- | :--- | :--- |
| `PERSONAL_TRANSACTION_QUERY` | pandas + ML analysis engine | *"How much did I spend on food last month?"* |
| `GENERAL_FINANCE_QUERY` | RAG pipeline over curated guides | *"How big should my emergency fund be?"* |

- Retrieval uses a **TF-IDF cosine-similarity** vector store over finance documents
- Answers are generated with the **Google Gemini API**, with a structured offline fallback if the API is unavailable
- Every RAG answer shows its **sources** (e.g. *Sources used: Emergency Fund Guide*)

---

## 🏗 Architecture

### How It Works

```
React UI  --(JWT)-->  FastAPI
                        |
        +---------------+----------------+----------------+
        |               |                |                |
     Auth Service   CSV Upload &     Dashboard        Chatbot Service
                    Cleaning         Metrics               |
                        |               |            Query Router
                        v               v           /             \
                 User-isolated CSV   ML Engine   Personal          General
                     storage      (KMeans +     (pandas + ML)    (RAG pipeline)
                                 Decision Tree)       |                |
                                                      v                v
                                              User CSV storage   TF-IDF Vector Store
                                                                       |
                                                              Finance guides + Gemini API
```

1. The React frontend authenticates with the backend and sends a JWT with every request.
2. Uploaded CSVs are cleaned with pandas and stored in a per-user directory.
3. The dashboard and analysis endpoints compute metrics and run the KMeans and Decision Tree models on that user's data.
4. The chatbot's query router decides whether a question is about the user's own transactions or about general finance, and sends it to the matching engine.
5. General questions go through the RAG pipeline: TF-IDF retrieval over finance guides, then answer generation with Gemini (or an offline fallback), with sources cited.

### Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Recharts, Lucide Icons, vanilla CSS (dark theme) |
| **Backend** | Python 3.13, FastAPI, Pydantic, Uvicorn |
| **Data / ML** | pandas, NumPy, scikit-learn (KMeans, DecisionTreeClassifier) |
| **AI / RAG** | TF-IDF vector store, custom document loader, Google Gemini API |
| **Auth** | JWT, PBKDF2-HMAC-SHA256 |
| **Storage** | Local CSV and JSON files |
| **Deployment** | Render |

<details>
<summary><b>📁 Project structure</b></summary>

```
financial-insights-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app & CORS
│   │   ├── config.py                # Settings & environment variables
│   │   ├── auth/                    # Password hashing, JWT, users.json
│   │   ├── api/                     # Route handlers: auth, upload, analyze, chat
│   │   ├── ml/                      # clustering.py, overspending.py, analysis.py
│   │   ├── rag/                     # document_loader.py, vector_store.py, rag_pipeline.py
│   │   ├── services/                # transaction_service.py, chatbot_service.py
│   │   └── data/                    # transactions/ and documents/
│   ├── tests/test_backend.py        # Pytest suite (auth, ML, RAG)
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/              # Chat, Sidebar, Message, Dashboard, UploadCSV, Charts, Navbar
│   │   ├── pages/                   # Login, Register, Home
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
├── sample_data/transactions.csv     # 50+ sample Indian transactions
├── documents/                       # RAG knowledge base (.txt guides)
└── README.md
```
</details>

---

## 🚀 Getting Started

### Prerequisites
- Python 3.13+
- Node.js 18+
- A free [Gemini API key](https://aistudio.google.com/) (optional; the app falls back to offline answers without it)

### 1. Clone the repository
```bash
git clone https://github.com/venkataganesh22/AI-Financial-Insights-Assistant
cd AI-Financial-Insights-Assistant
```

### 2. Configure environment variables
Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=replace_with_a_long_random_string
VITE_API_URL=http://localhost:8000
```

> 💡 Generate a strong secret with `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
> Never commit your `.env` file.

### 3. Run the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

pytest tests/test_backend.py    # optional: run the test suite
python run.py                   # http://localhost:8000
```

### 4. Run the frontend
```bash
cd frontend
npm install
npm run dev                     # http://localhost:3000
```

### 🔑 Demo Accounts (demo use only)

| Persona | Email | Password |
| :--- | :--- | :--- |
| Student | `student@example.com` | `Student@123` |
| Rahul | `rahul@example.com` | `Rahul@123` |
| Priya | `priya@example.com` | `Priya@123` |

---

## 📄 CSV Format

```csv
date,description,category,amount,type
2026-01-01,Monthly Salary from Tech Corp,Salary,75000,income
2026-01-02,House Rent Payment,Rent,15000,expense
2026-01-04,Swiggy Lunch Order,Food,450,expense
2026-01-07,Uber Auto to Office,Transport,180,expense
2026-01-10,Amazon India Shopping,Shopping,3200,expense
```

A ready-to-use file is available at [`sample_data/transactions.csv`](sample_data/transactions.csv).

---

## 🌐 API Reference

Interactive docs are available at `/docs` (Swagger UI) when the server is running.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/register` | ✗ | Register a new user |
| `POST` | `/auth/login` | ✗ | Authenticate and receive a JWT |
| `POST` | `/upload` | ✓ | Upload and process a transaction CSV |
| `GET` | `/dashboard` | ✓ | Summary metrics in ₹ INR |
| `GET` | `/analyze` | ✓ | KMeans persona and overspending insights |
| `POST` | `/chat` | ✓ | Chatbot (personal query or RAG) |
| `GET` | `/health` | ✗ | Health check for Render |

---

## ☁️ Deployment on Render

The app deploys as a **single Render Web Service**: FastAPI serves the built React bundle.

1. Push the repository to GitHub.
2. On [Render](https://render.com), choose **New +** → **Web Service** and connect the repo.
3. Configure the service:

   | Setting | Value |
   | :--- | :--- |
   | Runtime | Python 3 |
   | Root Directory | *(leave blank)* |
   | Build Command | `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt` |
   | Start Command | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

4. Add environment variables: `GEMINI_API_KEY`, `SECRET_KEY`, `PYTHON_VERSION=3.13.2`.
5. Deploy, then verify at `https://<your-service>.onrender.com/health`.

> ⚠️ **Ephemeral storage:** Render's free tier filesystem resets on restart or redeploy, so uploaded CSVs and registered users are lost. A production version would use PostgreSQL and object storage (e.g. S3).

---

## ⚠️ Limitations & Roadmap

**Current limitations**
- File-based storage (no database), suited to demos rather than production scale
- The overspending model is trained on synthetic thresholds, not real user data
- TF-IDF retrieval is keyword-based and can miss semantic matches

**Planned improvements**
- [ ] Migrate storage to PostgreSQL
- [ ] Replace TF-IDF with embedding-based semantic retrieval
- [ ] Support bank-statement PDF import
- [ ] Budget goals and monthly forecasting
- [ ] Docker setup and CI via GitHub Actions

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Please open an issue to discuss major changes before submitting a pull request.

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

## 👤 Author

**Guthi Venkata Ganesh**

