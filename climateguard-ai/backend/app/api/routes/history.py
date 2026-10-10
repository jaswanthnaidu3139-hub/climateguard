from fastapi import APIRouter, HTTPException, Query
from backend.app.database.repositories import LocationRepository
from backend.app.services.climate_service import ClimateService
from backend.app.utils.validation import validate_date_range

router = APIRouter(prefix="/api/climate", tags=["Climate History"])

@router.get("/history")
async def get_climate_history(
    location_id: str = Query(..., description="UUID of supported location"),
    start_date: str = Query(..., description="Start date YYYY-MM-DD"),
    end_date: str = Query(..., description="End date YYYY-MM-DD")
):
    validate_date_range(start_date, end_date, max_days=730)
    
    loc = LocationRepository.get_by_id(location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found.")
        
    history_data = await ClimateService.get_analyzed_history(
        lat=loc["latitude"],
        lon=loc["longitude"],
        location_id=loc["id"],
        location_name=loc["name"],
        state=loc["state"],
        start_date=start_date,
        end_date=end_date
    )
    return history_data
