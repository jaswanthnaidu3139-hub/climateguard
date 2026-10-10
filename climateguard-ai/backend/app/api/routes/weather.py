from fastapi import APIRouter, HTTPException, Query
from backend.app.schemas.weather import WeatherResponse
from backend.app.database.repositories import LocationRepository
from backend.app.services.weather_service import WeatherService

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("", response_model=WeatherResponse)
async def get_weather(location_id: str = Query(..., description="UUID of supported location")):
    loc = LocationRepository.get_by_id(location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found.")
    
    data = await WeatherService.get_current_and_forecast(
        lat=loc["latitude"],
        lon=loc["longitude"],
        location_id=loc["id"],
        location_name=loc["name"],
        state=loc["state"]
    )
    return data
