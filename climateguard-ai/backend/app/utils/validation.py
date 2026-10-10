from datetime import datetime, date
from typing import Optional, Tuple
from fastapi import HTTPException

def validate_coordinates(lat: float, lon: float) -> Tuple[float, float]:
    if not (-90.0 <= lat <= 90.0):
        raise HTTPException(status_code=400, detail=f"Latitude {lat} is invalid. Must be between -90 and 90.")
    if not (-180.0 <= lon <= 180.0):
        raise HTTPException(status_code=400, detail=f"Longitude {lon} is invalid. Must be between -180 and 180.")
    return lat, lon

def validate_date_range(start_date_str: str, end_date_str: str, max_days: int = 365) -> Tuple[date, date]:
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid start_date format '{start_date_str}'. Expected YYYY-MM-DD.")
    
    try:
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid end_date format '{end_date_str}'. Expected YYYY-MM-DD.")
    
    if start_date > end_date:
        raise HTTPException(status_code=400, detail=f"start_date ({start_date_str}) cannot be after end_date ({end_date_str}).")
    
    delta_days = (end_date - start_date).days
    if delta_days > max_days:
        raise HTTPException(
            status_code=400, 
            detail=f"Requested range of {delta_days} days exceeds maximum allowed limit of {max_days} days."
        )
    
    return start_date, end_date
