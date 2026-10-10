from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.schemas.location import Location
from backend.app.database.repositories import LocationRepository

router = APIRouter(prefix="/api/locations", tags=["Locations"])

@router.get("", response_model=List[Location])
async def get_locations():
    """
    Return all supported locations including Vijayawada, Hyderabad, and major regional centers.
    """
    locations = LocationRepository.get_all()
    return locations

@router.get("/{location_id}", response_model=Location)
async def get_location(location_id: str):
    """
    Return single location details by UUID.
    """
    loc = LocationRepository.get_by_id(location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found.")
    return loc
