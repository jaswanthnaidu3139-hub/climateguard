from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class CurrentWeather(BaseModel):
    temperature: float = Field(..., description="Current temperature in Celsius")
    relative_humidity: float = Field(..., description="Relative humidity percentage")
    precipitation: float = Field(0.0, description="Current precipitation in mm")
    weather_code: Optional[int] = Field(None, description="WMO weather interpretation code")
    wind_speed: Optional[float] = Field(None, description="Wind speed in km/h")
    time: str = Field(..., description="Observation ISO timestamp")

class DailyForecastItem(BaseModel):
    date: str
    temperature_max: float
    temperature_min: float
    precipitation_sum: float

class WeatherResponse(BaseModel):
    location_id: str
    location_name: str
    state: str
    latitude: float
    longitude: float
    current: CurrentWeather
    daily_forecast: List[DailyForecastItem]
    units: Dict[str, str] = {
        "temperature": "°C",
        "relative_humidity": "%",
        "precipitation": "mm",
        "wind_speed": "km/h"
    }
    source: str = "Open-Meteo Weather API"
    retrieved_at: str
    is_demo: bool = False
    status_message: Optional[str] = None

class HistoricalDayRecord(BaseModel):
    date: str
    temperature_max: Optional[float] = None
    temperature_min: Optional[float] = None
    temperature_mean: Optional[float] = None
    precipitation: Optional[float] = None

class HistoricalWeatherResponse(BaseModel):
    location_id: str
    location_name: str
    state: str
    start_date: str
    end_date: str
    records: List[HistoricalDayRecord]
    record_count: int
    data_source: str = "Open-Meteo Historical Archive"
    retrieved_at: str
    is_demo: bool = False
    baseline_summary: Optional[Dict[str, Any]] = None
    missing_data_info: Optional[Dict[str, Any]] = None
