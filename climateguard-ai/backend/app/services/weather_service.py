import time
import logging
from typing import Dict, Any, Optional
import httpx
from datetime import datetime, timezone, timedelta
from backend.app.config import settings

logger = logging.getLogger("climateguard.weather")

# In-memory cache: key -> {"timestamp": float, "data": dict}
_WEATHER_CACHE: Dict[str, Dict[str, Any]] = {}

class WeatherService:
    TIMEOUT_SECONDS = 10.0

    @classmethod
    def _get_cache(cls, cache_key: str) -> Optional[Dict[str, Any]]:
        cached = _WEATHER_CACHE.get(cache_key)
        if cached:
            elapsed = time.time() - cached["timestamp"]
            if elapsed < settings.CACHE_TTL_SECONDS:
                logger.info(f"Cache hit for key {cache_key} (age: {int(elapsed)}s)")
                return cached["data"]
        return None

    @classmethod
    def _set_cache(cls, cache_key: str, data: Dict[str, Any]):
        _WEATHER_CACHE[cache_key] = {
            "timestamp": time.time(),
            "data": data
        }

    @classmethod
    async def get_current_and_forecast(cls, lat: float, lon: float, location_id: str, location_name: str, state: str) -> Dict[str, Any]:
        cache_key = f"forecast_{round(lat, 4)}_{round(lon, 4)}"
        cached_data = cls._get_cache(cache_key)
        if cached_data:
            return cached_data

        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
            "timezone": "auto"
        }

        try:
            async with httpx.AsyncClient(timeout=cls.TIMEOUT_SECONDS) as client:
                response = await client.get(settings.OPEN_METEO_FORECAST_URL, params=params)
                response.raise_for_status()
                payload = response.json()

                current = payload.get("current", {})
                daily = payload.get("daily", {})

                daily_forecast = []
                dates = daily.get("time", [])
                max_temps = daily.get("temperature_2m_max", [])
                min_temps = daily.get("temperature_2m_min", [])
                precips = daily.get("precipitation_sum", [])

                for i in range(len(dates)):
                    daily_forecast.append({
                        "date": dates[i],
                        "temperature_max": max_temps[i] if i < len(max_temps) else 0.0,
                        "temperature_min": min_temps[i] if i < len(min_temps) else 0.0,
                        "precipitation_sum": precips[i] if i < len(precips) else 0.0,
                    })

                result = {
                    "location_id": location_id,
                    "location_name": location_name,
                    "state": state,
                    "latitude": lat,
                    "longitude": lon,
                    "current": {
                        "temperature": float(current.get("temperature_2m", 0.0)),
                        "relative_humidity": float(current.get("relative_humidity_2m", 50.0)),
                        "precipitation": float(current.get("precipitation", 0.0)),
                        "weather_code": current.get("weather_code"),
                        "wind_speed": float(current.get("wind_speed_10m", 0.0)),
                        "time": current.get("time", datetime.now(timezone.utc).isoformat())
                    },
                    "daily_forecast": daily_forecast,
                    "units": {
                        "temperature": "°C",
                        "relative_humidity": "%",
                        "precipitation": "mm",
                        "wind_speed": "km/h"
                    },
                    "source": "Open-Meteo Weather Forecast API",
                    "retrieved_at": datetime.now(timezone.utc).isoformat(),
                    "is_demo": False,
                    "status_message": "Live weather observations retrieved successfully."
                }

                cls._set_cache(cache_key, result)
                return result

        except Exception as e:
            logger.warning(f"Live weather API error for ({lat}, {lon}): {str(e)}. Using fallback demo data.")
            # If cached item exists regardless of TTL expiration, return it
            expired_cached = _WEATHER_CACHE.get(cache_key)
            if expired_cached:
                expired_data = dict(expired_cached["data"])
                expired_data["status_message"] = f"Network warning: Served from expired cache ({str(e)})"
                return expired_data

            # Fallback labeled demo data
            now_iso = datetime.now(timezone.utc).isoformat()
            demo_daily = []
            today = datetime.now(timezone.utc).date()
            for day_offset in range(7):
                d = today + timedelta(days=day_offset)
                demo_daily.append({
                    "date": d.isoformat(),
                    "temperature_max": 33.5 + (day_offset % 3),
                    "temperature_min": 24.0 + (day_offset % 2),
                    "precipitation_sum": 2.5 if day_offset % 2 == 0 else 0.0
                })

            return {
                "location_id": location_id,
                "location_name": location_name,
                "state": state,
                "latitude": lat,
                "longitude": lon,
                "current": {
                    "temperature": 32.5,
                    "relative_humidity": 65.0,
                    "precipitation": 0.0,
                    "weather_code": 1,
                    "wind_speed": 12.0,
                    "time": now_iso
                },
                "daily_forecast": demo_daily,
                "units": {
                    "temperature": "°C",
                    "relative_humidity": "%",
                    "precipitation": "mm",
                    "wind_speed": "km/h"
                },
                "source": "ClimateGuard Fallback Dataset (Open-Meteo Unavailable)",
                "retrieved_at": now_iso,
                "is_demo": True,
                "status_message": f"API connection issue: {str(e)}. Displaying clearly labeled demonstration data."
            }

    @classmethod
    async def get_historical_records(cls, lat: float, lon: float, location_id: str, location_name: str, state: str, start_date: str, end_date: str) -> Dict[str, Any]:
        cache_key = f"hist_{round(lat, 4)}_{round(lon, 4)}_{start_date}_{end_date}"
        cached_data = cls._get_cache(cache_key)
        if cached_data:
            return cached_data

        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum",
            "timezone": "auto"
        }

        try:
            async with httpx.AsyncClient(timeout=cls.TIMEOUT_SECONDS + 5.0) as client:
                response = await client.get(settings.OPEN_METEO_ARCHIVE_URL, params=params)
                response.raise_for_status()
                payload = response.json()

                daily = payload.get("daily", {})
                dates = daily.get("time", [])
                t_max = daily.get("temperature_2m_max", [])
                t_min = daily.get("temperature_2m_min", [])
                t_mean = daily.get("temperature_2m_mean", [])
                precips = daily.get("precipitation_sum", [])

                records = []
                for i in range(len(dates)):
                    records.append({
                        "date": dates[i],
                        "temperature_max": t_max[i] if i < len(t_max) else None,
                        "temperature_min": t_min[i] if i < len(t_min) else None,
                        "temperature_mean": t_mean[i] if i < len(t_mean) else None,
                        "precipitation": precips[i] if i < len(precips) else 0.0
                    })

                # Calculate baseline summary
                valid_means = [r["temperature_mean"] for r in records if r["temperature_mean"] is not None]
                valid_precips = [r["precipitation"] for r in records if r["precipitation"] is not None]

                baseline_summary = {
                    "mean_temperature": round(sum(valid_means) / len(valid_means), 2) if valid_means else 0.0,
                    "total_precipitation": round(sum(valid_precips), 2) if valid_precips else 0.0,
                    "avg_daily_precipitation": round(sum(valid_precips) / len(valid_precips), 2) if valid_precips else 0.0,
                    "days_with_rain": len([p for p in valid_precips if p > 0.1]),
                    "record_count": len(records)
                }

                result = {
                    "location_id": location_id,
                    "location_name": location_name,
                    "state": state,
                    "start_date": start_date,
                    "end_date": end_date,
                    "records": records,
                    "record_count": len(records),
                    "data_source": "Open-Meteo Historical Archive API",
                    "retrieved_at": datetime.now(timezone.utc).isoformat(),
                    "is_demo": False,
                    "baseline_summary": baseline_summary,
                    "missing_data_info": {
                        "missing_temperature_days": len(dates) - len(valid_means),
                        "missing_precipitation_days": len(dates) - len(valid_precips)
                    }
                }

                cls._set_cache(cache_key, result)
                return result

        except Exception as e:
            logger.warning(f"Historical API error for ({lat}, {lon}) [{start_date} to {end_date}]: {str(e)}")
            # Fallback synthetic historical records for demo mode
            import random
            start_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_dt = datetime.strptime(end_date, "%Y-%m-%d").date()
            delta = (end_dt - start_dt).days + 1

            records = []
            for i in range(min(delta, 180)):
                d = start_dt + timedelta(days=i)
                # Seasonal baseline approximation
                records.append({
                    "date": d.isoformat(),
                    "temperature_max": round(32.0 + (i % 7) * 0.8, 1),
                    "temperature_min": round(23.0 + (i % 5) * 0.5, 1),
                    "temperature_mean": round(27.5 + (i % 6) * 0.6, 1),
                    "precipitation": round(5.0 if (i % 6 == 0) else 0.0, 1)
                })

            valid_means = [r["temperature_mean"] for r in records if r["temperature_mean"] is not None]
            valid_precips = [r["precipitation"] for r in records if r["precipitation"] is not None]

            return {
                "location_id": location_id,
                "location_name": location_name,
                "state": state,
                "start_date": start_date,
                "end_date": end_date,
                "records": records,
                "record_count": len(records),
                "data_source": "ClimateGuard Fallback Dataset (Archive Unavailable)",
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                "is_demo": True,
                "baseline_summary": {
                    "mean_temperature": round(sum(valid_means) / len(valid_means), 2) if valid_means else 0.0,
                    "total_precipitation": round(sum(valid_precips), 2) if valid_precips else 0.0,
                    "avg_daily_precipitation": round(sum(valid_precips) / len(valid_precips), 2) if valid_precips else 0.0,
                    "days_with_rain": len([p for p in valid_precips if p > 0.1]),
                    "record_count": len(records)
                },
                "missing_data_info": {
                    "note": f"Historical archive API unreachable: {str(e)}"
                }
            }
