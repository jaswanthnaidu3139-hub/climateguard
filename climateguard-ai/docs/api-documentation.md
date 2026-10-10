# ClimateGuard AI — API Specification

The ClimateGuard AI REST API provides climate intelligence, risk calculations, historical analytics, what-if simulations, and action planning.

Base URL: `http://localhost:8000` (or configured deployment URL)  
Interactive OpenAPI UI: `http://localhost:8000/docs`

---

## Endpoints

### 1. System Health
- **Route**: `GET /api/health`
- **Description**: Returns server status, environment, version, and external provider connectivity.
- **Response**:
```json
{
  "status": "healthy",
  "app_name": "ClimateGuard AI Backend",
  "version": "1.0.0",
  "environment": "development",
  "supabase_connected": false,
  "primary_weather_provider": "Open-Meteo API",
  "timestamp": 1728518400.0
}
```

---

### 2. Supported Locations
- **Route**: `GET /api/locations`
- **Description**: Returns all supported locations with validated latitude and longitude.
- **Response**: Array of:
```json
[
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Vijayawada",
    "state": "Andhra Pradesh",
    "latitude": 16.5062,
    "longitude": 80.648,
    "country": "India",
    "elevation": 11.0,
    "timezone": "Asia/Kolkata"
  }
]
```

---

### 3. Current Weather & Forecast
- **Route**: `GET /api/weather?location_id={uuid}`
- **Description**: Fetches current observation (temperature, humidity, precipitation, wind speed) and 7-day daily forecast from Open-Meteo with caching.
- **Response**:
```json
{
  "location_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "location_name": "Vijayawada",
  "state": "Andhra Pradesh",
  "latitude": 16.5062,
  "longitude": 80.648,
  "current": {
    "temperature": 32.5,
    "relative_humidity": 65.0,
    "precipitation": 0.0,
    "weather_code": 1,
    "wind_speed": 12.0,
    "time": "2026-10-10T00:00:00Z"
  },
  "daily_forecast": [...],
  "units": {
    "temperature": "°C",
    "relative_humidity": "%",
    "precipitation": "mm",
    "wind_speed": "km/h"
  },
  "source": "Open-Meteo Weather Forecast API",
  "retrieved_at": "2026-10-10T00:00:00Z",
  "is_demo": false,
  "status_message": "Live weather observations retrieved successfully."
}
```

---

### 4. Climate History & Anomalies
- **Route**: `GET /api/climate/history?location_id={uuid}&start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}`
- **Description**: Historical weather daily records, baseline statistics, monthly aggregations, and standardized z-score temperature anomaly detection.

---

### 5. Risk Assessment
- **Route**: `GET /api/risk?location_id={uuid}`
- **Description**: Evaluates normalized indicators ($S_{heat}$, $S_{rain}$, $S_{dry}$) and weighted overall score, categorizes risk (Low, Moderate, High), and includes deterministic recommendations.
- **Response**:
```json
{
  "location_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "location_name": "Vijayawada",
  "state": "Andhra Pradesh",
  "assessment_timestamp": "2026-10-10T00:00:00Z",
  "overall_score": 42.5,
  "risk_level": "Moderate",
  "heat_score": 40.0,
  "rainfall_score": 55.0,
  "dry_spell_score": 25.0,
  "indicator_details": {...},
  "contributing_factors": {...},
  "recommendations": [...],
  "methodology_version": "v1.0-mvp",
  "limitations_and_uncertainty": "..."
}
```

---

### 6. What-If Scenario Simulation
- **Route**: `POST /api/risk/simulate`
- **Payload**:
```json
{
  "location_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "hypothetical_temp_max": 42.5,
  "hypothetical_daily_rainfall": 50.0,
  "hypothetical_rolling_rainfall_deficit_pct": -60.0
}
```
- **Description**: Evaluates simulated environmental conditions against the documented formula without modifying or corrupting real database records.

---

### 7. Action Recommendations
- **Route**: `GET /api/recommendations?location_id={uuid}`
- **Description**: Prioritized mitigation and adaptation actions mapped to triggered risk thresholds.

---

### 8. Multi-City Comparison
- **Route**: `GET /api/compare?location_ids={uuid1},{uuid2}`
- **Description**: Side-by-side indicator scores, thermal metrics, and rainfall comparisons across 2 to 6 cities.
