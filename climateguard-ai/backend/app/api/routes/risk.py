from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timezone, timedelta
from typing import List
from backend.app.schemas.risk import RiskAssessmentResponse, WhatIfSimulationRequest, WhatIfSimulationResponse
from backend.app.database.repositories import LocationRepository, RiskRepository
from backend.app.services.weather_service import WeatherService
from backend.app.services.risk_engine import RiskEngine
from backend.app.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/api/risk", tags=["Risk Engine"])

async def _compute_assessment_for_location(loc: dict) -> dict:
    weather = await WeatherService.get_current_and_forecast(
        lat=loc["latitude"],
        lon=loc["longitude"],
        location_id=loc["id"],
        location_name=loc["name"],
        state=loc["state"]
    )
    
    current = weather.get("current", {})
    daily = weather.get("daily_forecast", [])
    
    # Max temperature from today's forecast or current temperature
    max_temp = current.get("temperature")
    if daily and len(daily) > 0 and daily[0].get("temperature_max"):
        max_temp = daily[0]["temperature_max"]
        
    daily_precip = current.get("precipitation", 0.0)
    if daily and len(daily) > 0 and daily[0].get("precipitation_sum"):
        daily_precip = daily[0]["precipitation_sum"]

    # 14-day rolling proxy from forecast + baseline estimation
    observed_rolling = sum(d.get("precipitation_sum", 0.0) for d in daily[:7]) * 2.0
    baseline_rolling = 25.0  # Seasonal 14d standard baseline benchmark

    assessment = RiskEngine.calculate_assessment(
        location_id=loc["id"],
        location_name=loc["name"],
        state=loc["state"],
        max_temp=max_temp,
        daily_precip_mm=daily_precip,
        observed_rolling_precip=observed_rolling,
        baseline_rolling_precip=baseline_rolling,
        timestamp_str=datetime.now(timezone.utc).isoformat(),
        data_source=weather.get("source", "Open-Meteo"),
        is_demo=weather.get("is_demo", False)
    )

    # Attach recommendations
    recs = RecommendationEngine.generate_recommendations(
        heat_score=assessment["heat_score"],
        rainfall_score=assessment["rainfall_score"],
        dry_spell_score=assessment["dry_spell_score"]
    )
    assessment["recommendations"] = [r.model_dump() for r in recs]

    # Save to history repository
    RiskRepository.save_assessment(assessment)
    return assessment

@router.get("", response_model=RiskAssessmentResponse)
async def get_risk_assessment(location_id: str = Query(..., description="UUID of supported location")):
    loc = LocationRepository.get_by_id(location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found.")
        
    assessment = await _compute_assessment_for_location(loc)
    return assessment

@router.post("/simulate", response_model=WhatIfSimulationResponse)
async def simulate_what_if_scenario(request: WhatIfSimulationRequest):
    loc = LocationRepository.get_by_id(request.location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{request.location_id}' not found.")
        
    base_assessment = await _compute_assessment_for_location(loc)
    
    simulation = RiskEngine.simulate_what_if(
        base_assessment=base_assessment,
        hypothetical_temp_max=request.hypothetical_temp_max,
        hypothetical_daily_rainfall=request.hypothetical_daily_rainfall,
        hypothetical_rolling_rainfall_deficit_pct=request.hypothetical_rolling_rainfall_deficit_pct
    )
    return simulation

@router.get("/{location_id}/history")
async def get_risk_history(location_id: str, limit: int = Query(20, ge=1, le=100)):
    loc = LocationRepository.get_by_id(location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found.")
        
    history = RiskRepository.get_history_by_location(location_id, limit=limit)
    return {
        "location_id": loc["id"],
        "location_name": loc["name"],
        "record_count": len(history),
        "history": history
    }
