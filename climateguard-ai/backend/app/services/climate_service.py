from typing import Dict, Any, List
from datetime import datetime
import pandas as pd
from backend.app.services.weather_service import WeatherService
from backend.app.services.anomaly_service import AnomalyService

class ClimateService:
    @classmethod
    async def get_analyzed_history(
        cls, 
        lat: float, 
        lon: float, 
        location_id: str, 
        location_name: str, 
        state: str, 
        start_date: str, 
        end_date: str
    ) -> Dict[str, Any]:
        raw_history = await WeatherService.get_historical_records(
            lat, lon, location_id, location_name, state, start_date, end_date
        )

        records = raw_history.get("records", [])
        if not records:
            return raw_history

        # Run anomaly detection
        anomalies_info = AnomalyService.detect_temperature_anomalies(records)
        percentile_stats = AnomalyService.calculate_percentiles(records)

        # Monthly aggregation using pandas for clean data aggregation
        try:
            df = pd.DataFrame(records)
            df["date"] = pd.to_datetime(df["date"])
            df["month"] = df["date"].dt.strftime("%Y-%m")
            monthly_grouped = df.groupby("month").agg({
                "temperature_max": "mean",
                "temperature_min": "mean",
                "temperature_mean": "mean",
                "precipitation": "sum"
            }).reset_index()

            monthly_data = []
            for _, row in monthly_grouped.iterrows():
                monthly_data.append({
                    "month": row["month"],
                    "avg_temp_max": round(row["temperature_max"], 1) if pd.notnull(row["temperature_max"]) else None,
                    "avg_temp_min": round(row["temperature_min"], 1) if pd.notnull(row["temperature_min"]) else None,
                    "mean_temp": round(row["temperature_mean"], 1) if pd.notnull(row["temperature_mean"]) else None,
                    "total_precipitation": round(row["precipitation"], 1) if pd.notnull(row["precipitation"]) else 0.0
                })
        except Exception:
            monthly_data = []

        raw_history["anomaly_analysis"] = anomalies_info
        raw_history["percentile_distribution"] = percentile_stats
        raw_history["monthly_trends"] = monthly_data
        return raw_history
