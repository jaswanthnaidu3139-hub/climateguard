from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from backend.app.database.repositories import LocationRepository
from backend.app.api.routes.risk import _compute_assessment_for_location
from backend.app.services.weather_service import WeatherService

router = APIRouter(prefix="/api/compare", tags=["City Comparison"])

@router.get("")
async def compare_locations(location_ids: str = Query(..., description="Comma-separated location UUIDs (e.g. id1,id2)")):
    ids = [i.strip() for i in location_ids.split(",") if i.strip()]
    if len(ids) < 2:
        raise HTTPException(status_code=400, detail="Comparison requires at least 2 location IDs separated by commas.")
    if len(ids) > 6:
        raise HTTPException(status_code=400, detail="Maximum 6 locations can be compared simultaneously.")

    results: List[Dict[str, Any]] = []
    warnings: List[str] = []

    for loc_id in ids:
        loc = LocationRepository.get_by_id(loc_id)
        if not loc:
            warnings.append(f"Location ID '{loc_id}' was not found in supported registry and was omitted.")
            continue

        try:
            assessment = await _compute_assessment_for_location(loc)
            weather = await WeatherService.get_current_and_forecast(
                lat=loc["latitude"],
                lon=loc["longitude"],
                location_id=loc["id"],
                location_name=loc["name"],
                state=loc["state"]
            )
            
            results.append({
                "location_id": loc["id"],
                "name": loc["name"],
                "state": loc["state"],
                "latitude": loc["latitude"],
                "longitude": loc["longitude"],
                "current_temperature": weather["current"]["temperature"],
                "relative_humidity": weather["current"]["humidity"] if "humidity" in weather["current"] else weather["current"].get("relative_humidity"),
                "current_precipitation": weather["current"]["precipitation"],
                "overall_risk_score": assessment["overall_score"],
                "risk_level": assessment["risk_level"],
                "heat_score": assessment["heat_score"],
                "rainfall_score": assessment["rainfall_score"],
                "dry_spell_score": assessment["dry_spell_score"],
                "data_source": assessment["data_source"],
                "is_demo": assessment.get("is_demo", False)
            })
        except Exception as e:
            warnings.append(f"Failed to fetch real-time intelligence for {loc['name']}: {str(e)}")

    if not results:
        raise HTTPException(status_code=404, detail="None of the specified locations could be resolved.")

    return {
        "compared_locations_count": len(results),
        "locations": results,
        "warnings": warnings,
        "units": {
            "temperature": "°C",
            "precipitation": "mm",
            "humidity": "%",
            "risk_score": "0-100 index"
        }
    }
