from fastapi import APIRouter, HTTPException, Query
from typing import List
from backend.app.schemas.risk import RecommendationItem
from backend.app.database.repositories import LocationRepository
from backend.app.api.routes.risk import _compute_assessment_for_location

router = APIRouter(prefix="/api/recommendations", tags=["Action Recommendations"])

@router.get("", response_model=List[RecommendationItem])
async def get_recommendations(location_id: str = Query(..., description="UUID of supported location")):
    loc = LocationRepository.get_by_id(location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found.")
        
    assessment = await _compute_assessment_for_location(loc)
    return assessment.get("recommendations", [])
