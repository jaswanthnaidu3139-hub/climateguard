from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class LocationBase(BaseModel):
    name: str = Field(..., description="Location/City name")
    state: str = Field(..., description="State or province")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")
    country: str = Field("India", description="Country name")
    elevation: Optional[float] = Field(None, description="Elevation in meters")
    timezone: str = Field("Asia/Kolkata", description="IANA timezone name")

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: str = Field(..., description="UUID identifier")
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
