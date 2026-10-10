# ClimateGuard AI — Community Climate Risk Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18/19-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-13%20Passed-brightgreen.svg)]()

> A functional, professional-quality climate risk decision-support platform designed for ordinary citizens, urban planners, educators, and community leaders to transform raw weather data into explainable risk indicators, historical trend analytics, interactive geospatial maps, and practical adaptation actions.

---

## 1. Problem Statement
Climate volatility increases the frequency and severity of extreme thermal events, localized precipitation deluges, and agricultural dry spells. However, climate data is typically fragmented across academic silos and raw meteorological datasets. 

**ClimateGuard AI answers three fundamental community questions:**
1. **What is happening right now** in the monitored urban center?
2. **What climate-related risks or unusual patterns** are indicated by the available data?
3. **What practical actions** can citizens and civic planners consider?

*Disclaimer: ClimateGuard AI is an analytical screening and decision-support tool. It is not an official replacement for government disaster management warnings or life-safety alerts issued by the IMD or NDMA.*

---

## 2. Core Features & Pages

| Page | Feature | Description |
|---|---|---|
| **Page 1: Overview Dashboard** | Real-time Risk Intelligence | Live weather KPIs, compound 0–100 risk score, sub-index meters, 7-day forecast trend, and priority actions. |
| **Page 2: Climate Analysis** | Historical Trends & Anomalies | Multi-month daily trajectories, precipitation distribution, baseline statistics, and standardized $Z \ge 2.0\sigma$ temperature anomalies. |
| **Page 3: Interactive Risk Map** | Leaflet Geospatial Intelligence | Visualizes monitored cities (Vijayawada, Hyderabad, etc.) with color-coded risk markers and click-through drilldown. |
| **Page 4: Risk & What-If Sim** | Transparent Auditing & Simulator | Mathematical weight breakdown and an interactive scenario simulator to model hypothetical weather perturbations. |
| **Page 5: Action Planner** | Practical Adaptation Guidance | Rule-based, explainable recommendations for extreme heat, heavy rainfall, and dry-spell water stewardship with action checklists. |
| **Page 6: City Comparison** | Multi-City Benchmarking | Side-by-side comparative analytics across 2 to 5 Indian urban centers with comparative bar charts. |
| **Page 7: Methodology & About** | Scientific Transparency | Mathematical formulations, data source integrity, threshold benchmarks, and limitations. |

---

## 3. Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Recharts, React Leaflet, Lucide React.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2, Pandas, NumPy, Scikit-learn, HTTPX.
- **Data Integrations**: Open-Meteo Weather Forecast API, Open-Meteo Historical Archive API, OpenStreetMap Carto Tiles.
- **Database**: Supabase PostgreSQL with schema migrations, indexes, seed records, and an automatic in-memory fallback.

---

## 4. Local Quickstart Instructions

### Prerequisites
- Node.js (v18+) and npm
- Python (v3.10+)

### A. Backend Setup
```bash
cd climateguard-ai/backend

# 1. Create and activate a Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env

# 4. Start the FastAPI backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### B. Frontend Setup
```bash
cd climateguard-ai/frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start the Vite dev server
npm run dev
```
- Open your browser to `http://localhost:5173`

---

## 5. Automated Tests

The backend includes a comprehensive pytest suite covering:
- Threshold boundary conditions for extreme heat ($<32^\circ\text{C}$, $32-35^\circ\text{C}$, $35-40^\circ\text{C}$, $>40^\circ\text{C}$).
- Heavy rainfall score scaling ($0\text{mm}$ to extreme deluge).
- Numerically safe dry-spell anomalies avoiding division by zero.
- Strict $0 \le \text{Score} \le 100$ boundary guarantees.
- What-If scenario perturbation delta calculations without record corruption.
- Deterministic recommendation trigger conditions.
- Input validation (date ranges, coordinates, location IDs).

### Running Tests:
```bash
cd climateguard-ai
python -m pytest backend/tests -v
```
**Results: 13 passed in 6.79s.**

---

## 6. Monorepo Structure

```
climateguard-ai/
├── frontend/
│   ├── src/
│   │   ├── components/      # Badges, IndicatorCards, Skeletons
│   │   ├── context/         # LocationContext global state
│   │   ├── layouts/         # DashboardLayout with sidebar & header
│   │   ├── pages/           # 7 full functional pages
│   │   ├── services/        # api.js HTTP client
│   │   ├── App.jsx          # Router
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind design tokens & Leaflet styles
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── api/routes/      # locations, weather, history, risk, recs, compare
│   │   ├── services/        # weather_service, risk_engine, anomaly_service
│   │   ├── database/        # connection.py, repositories.py
│   │   ├── schemas/         # Pydantic data models
│   │   ├── utils/           # Coordinate & date range validation
│   │   ├── config.py        # Pydantic Settings
│   │   └── main.py          # FastAPI application
│   ├── tests/               # 13 Automated pytest test cases
│   ├── requirements.txt
│   └── .env.example
├── database/
│   ├── schema.sql           # PostgreSQL schema with UUIDs & indexes
│   └── seed.sql             # Real coordinates for 8 Indian cities
├── docs/
│   ├── architecture.md      # Mathematical models & diagrams
│   ├── api-documentation.md # REST API endpoint references
│   └── deployment.md        # Render, Vercel & Supabase deployment
└── README.md
```

---

## 7. Three-Minute Judge Demonstration Script

- **[0:00 - 0:30] The Challenge & Vision**:  
  "Judges, climate disruption is no longer a distant abstract phenomenon—it is impacting municipal infrastructure, public health, and agricultural communities daily. However, existing meteorological portals show raw numbers without context. ClimateGuard AI turns public weather streams into explainable, location-specific risk indicators and community action plans."
- **[0:30 - 1:15] Overview Dashboard & Indicators**:  
  "Here on our Overview Dashboard, we see Vijayawada. Our backend connects directly to Open-Meteo's forecast API. We calculate a normalized composite score of 0 to 100 broken down into Extreme Heat, Heavy Rainfall Runoff, and a 14-day Dry-Spell Deficit index. Notice our data freshness indicators and transparent scoring."
- **[1:15 - 1:55] Historical Anomaly Detection & Leaflet Map**:  
  "On Page 2, our Climate Analysis module computes historical baselines over 30, 60, or 180 days, automatically isolating statistically significant temperature anomalies where $|Z| \ge 2.0\sigma$. On Page 3, our interactive Leaflet map benchmarks cities like Hyderabad, Visakhapatnam, and Bengaluru with real-time risk markers."
- **[1:55 - 2:35] What-If Stress Testing Simulator**:  
  "On Page 4, we empower city planners with our What-If Simulator. If Vijayawada encounters a heat spike to 45°C coupled with a deluge of 60mm, we can test that stress scenario in real-time without modifying recorded data, seeing exactly how the risk score shifts."
- **[2:35 - 3:00] Actionable Recommendations & Wrap-up**:  
  "Finally, on Page 5, our rule-based engine translates these indicators into prioritized municipal and citizen actions—such as cooling center activation and stormwater drain inspections. ClimateGuard AI is fully built, tested with 13 automated tests, and ready for deployment."

---

## 8. Team Collaboration Breakdown (3–4 Developers)

- **Developer 1 (Frontend Lead)**: Dashboard UI, responsive sidebar, Recharts visualization, and Leaflet map integration.
- **Developer 2 (Backend & API Lead)**: FastAPI setup, Open-Meteo HTTPX asynchronous client, in-memory TTL caching, and OpenAPI schemas.
- **Developer 3 (Data & Risk Engine Lead)**: Mathematical risk indicator algorithms, standardized Z-score anomaly detector, and deterministic recommendation engine.
- **Developer 4 (Database & DevOps Lead)**: Supabase PostgreSQL schema, seed data, automated test suite, and cloud deployment pipelines.
