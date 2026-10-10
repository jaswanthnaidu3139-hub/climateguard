# ClimateGuard AI — Architecture Specification

## 1. Executive Summary
ClimateGuard AI is a software-only Community Climate Risk Intelligence Platform designed to convert multi-source atmospheric observations and historical climate data into localized, explainable risk indicators, climate trend visualizations, interactive geospatial maps, and community-level adaptation recommendations.

---

## 2. System Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    USER INTERFACE                                     |
|                       React 18 + Vite + Tailwind CSS + Lucide                         |
|   +-------------------+  +-------------------+  +----------------+  +-------------+   |
|   | Dashboard & Gauges|  | Climate Trends    |  | Leaflet GeoMap |  | What-If Sim |   |
|   +-------------------+  +-------------------+  +----------------+  +-------------+   |
+-------------------------------------------+-------------------------------------------+
                                            | REST API / JSON
                                            v
+---------------------------------------------------------------------------------------+
|                                  FASTAPI BACKEND                                      |
|                                                                                       |
|   [ CORS & Pydantic Validation Middleware ]                                           |
|       |                                                                               |
|       +--> API Routers:                                                               |
|       |    /api/health            /api/weather            /api/risk                   |
|       |    /api/locations         /api/climate/history    /api/recommendations        |
|       |    /api/compare           /api/risk/simulate      /api/risk/{id}/history      |
|       |                                                                               |
|       +--> Domain Services:                                                           |
|       |    * WeatherService (Open-Meteo REST Client + In-Memory TTL Cache)            |
|       |    * ClimateRiskEngine (Normalized Heat, Rainfall & Dry-Spell Scoring)         |
|       |    * RecommendationEngine (Deterministic Action Logic)                        |
|       |    * AnomalyService (Statistical Z-Scores & Percentiles)                      |
|       |                                                                               |
|       +--> Data Persistence Layer:                                                    |
|            * Supabase PostgreSQL Client (Real-time Cloud Storage)                     |
|            * Local In-Memory / SQLite Repository (Zero-dependency Demo Fallback)      |
+---------------------+-----------------------------------------+-----------------------+
                      |                                         |
                      v                                         v
+-------------------------------+                     +---------------------------------+
|  EXTERNAL CLIMATE SERVICES    |                     |    PERSISTENT STORAGE           |
|  * Open-Meteo Forecast API    |                     |  * Supabase PostgreSQL Database |
|  * Open-Meteo Archive API     |                     |    - locations table            |
|  * OpenStreetMap Carto Tiles  |                     |    - climate_records table      |
|                               |                     |    - risk_assessments table     |
+-------------------------------+                     +---------------------------------+
```

---

## 3. Mathematical Risk Engine Formulation

All individual indicators and the composite score are strictly normalized between `0.0` and `100.0`.

### A. Heat Stress Indicator ($S_{heat}$)
Calculated from maximum daily ambient temperature ($T_{max}$):
$$
S_{heat} =
\begin{cases}
20.0 & \text{if } T_{max} < 32^\circ\text{C} \\
40.0 & \text{if } 32^\circ\text{C} \le T_{max} < 35^\circ\text{C} \\
70.0 & \text{if } 35^\circ\text{C} \le T_{max} \le 40^\circ\text{C} \\
\min(100.0, 90.0 + 2.0 \cdot (T_{max} - 40.0)) & \text{if } T_{max} > 40^\circ\text{C}
\end{cases}
$$

### B. Heavy-Rainfall Indicator ($S_{rain}$)
Calculated from 24-hour precipitation volume ($P_{24h}$ in mm):
$$
S_{rain} =
\begin{cases}
15.0 & \text{if } P_{24h} \le 1.0\text{ mm} \\
30.0 & \text{if } 1.0 < P_{24h} \le 15.0\text{ mm} \\
55.0 & \text{if } 15.0 < P_{24h} \le 35.0\text{ mm} \\
75.0 & \text{if } 35.0 < P_{24h} \le 65.0\text{ mm} \\
\min(100.0, 90.0 + 0.2 \cdot (P_{24h} - 65.0)) & \text{if } P_{24h} > 65.0\text{ mm}
\end{cases}
$$

### C. Dry-Spell Indicator ($S_{dry}$)
Derived from cumulative rolling 14-day rainfall ($P_{obs}$) relative to historical seasonal baseline ($P_{base}$):
$$
\text{Anomaly } A = \frac{P_{obs} - P_{base}}{\max(P_{base}, \epsilon)}, \quad \epsilon = 1.0\text{ mm}
$$
$$
S_{dry} =
\begin{cases}
20.0 & \text{if } A \ge -0.15 \text{ (Normal/Surplus)} \\
40.0 & \text{if } -0.40 \le A < -0.15 \text{ (Mild Deficit)} \\
65.0 & \text{if } -0.70 \le A < -0.40 \text{ (Significant Deficit)} \\
88.0 & \text{if } A < -0.70 \text{ (Severe Drought Conditions)}
\end{cases}
$$

### D. Composite Overall Climate Risk Score
$$
\text{Score}_{overall} = 0.40 \cdot S_{heat} + 0.35 \cdot S_{rain} + 0.25 \cdot S_{dry}
$$

**Category Classification:**
- `Low Risk`: $\text{Score} < 30.0$
- `Moderate Risk`: $30.0 \le \text{Score} < 60.0$
- `High Risk`: $\text{Score} \ge 60.0$

---

## 4. Key Design Tenets
1. **Explainable AI/Analytics**: Every score card shows raw parameters, thresholds used, weights, and narrative explanations.
2. **Resilience & Fallback**: Network failures trigger automated in-memory cache delivery, followed by clearly labeled demo modes. No silent mock substitutions.
3. **Safety & Ethics Disclaimer**: Clear statement that risk indicators are diagnostic models, not official life-safety warnings.
