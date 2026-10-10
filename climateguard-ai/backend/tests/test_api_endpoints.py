import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "supabase_connected" in data

def test_get_locations_endpoint():
    response = client.get("/api/locations")
    assert response.status_code == 200
    locations = response.json()
    assert isinstance(locations, list)
    assert len(locations) >= 2
    
    # Check that Vijayawada and Hyderabad are present
    names = [loc["name"] for loc in locations]
    assert "Vijayawada" in names
    assert "Hyderabad" in names

def test_invalid_location_404():
    response = client.get("/api/weather?location_id=non-existent-id")
    assert response.status_code == 404

def test_invalid_history_dates():
    # start_date > end_date
    loc_res = client.get("/api/locations")
    loc_id = loc_res.json()[0]["id"]
    response = client.get(f"/api/climate/history?location_id={loc_id}&start_date=2026-05-10&end_date=2026-05-01")
    assert response.status_code == 400

def test_city_comparison_endpoint():
    locs = client.get("/api/locations").json()
    id1 = locs[0]["id"]
    id2 = locs[1]["id"]
    response = client.get(f"/api/compare?location_ids={id1},{id2}")
    assert response.status_code == 200
    data = response.json()
    assert data["compared_locations_count"] == 2
    assert len(data["locations"]) == 2

def test_what_if_simulation_endpoint():
    locs = client.get("/api/locations").json()
    id1 = locs[0]["id"]
    payload = {
        "location_id": id1,
        "hypothetical_temp_max": 45.0,
        "hypothetical_daily_rainfall": 50.0
    }
    response = client.post("/api/risk/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_hypothetical"] is True
    assert "score_delta" in data
    assert "scenario_indicators" in data
