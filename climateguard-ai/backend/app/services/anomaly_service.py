from typing import List, Dict, Any, Optional
import numpy as np

class AnomalyService:
    @staticmethod
    def detect_temperature_anomalies(
        records: List[Dict[str, Any]], 
        std_threshold: float = 2.0
    ) -> Dict[str, Any]:
        """
        Calculates standardized temperature anomalies (z-scores) and identifies statistical outliers.
        """
        valid_records = [
            r for r in records 
            if r.get("temperature_mean") is not None
        ]
        
        if len(valid_records) < 7:
            return {
                "method": "Standardized Temperature Z-Score",
                "sufficient_data": False,
                "message": f"Sample size too small ({len(valid_records)} records, minimum 7 required for baseline statistics)",
                "anomalies": []
            }

        temps = np.array([float(r["temperature_mean"]) for r in valid_records])
        mean_t = float(np.mean(temps))
        std_t = float(np.std(temps))

        if std_t < 0.1:  # Virtually zero variance
            std_t = 1.0

        anomalies = []
        for r in valid_records:
            t = float(r["temperature_mean"])
            z_score = (t - mean_t) / std_t
            if abs(z_score) >= std_threshold:
                direction = "warm" if z_score > 0 else "cold"
                anomalies.append({
                    "date": r["date"],
                    "temperature": round(t, 1),
                    "mean_baseline": round(mean_t, 1),
                    "z_score": round(float(z_score), 2),
                    "direction": direction,
                    "explanation": f"{abs(z_score):.1f} standard deviations {direction}er than the period baseline mean ({mean_t:.1f}°C)."
                })

        return {
            "method": "Standardized Temperature Z-Score (retrospective baseline)",
            "sufficient_data": True,
            "baseline_period_days": len(valid_records),
            "baseline_mean_c": round(mean_t, 2),
            "baseline_std_c": round(std_t, 2),
            "anomaly_count": len(anomalies),
            "anomalies": anomalies
        }

    @staticmethod
    def calculate_percentiles(records: List[Dict[str, Any]]) -> Dict[str, Any]:
        valid_temps = [float(r["temperature_max"]) for r in records if r.get("temperature_max") is not None]
        valid_precips = [float(r["precipitation"]) for r in records if r.get("precipitation") is not None]

        summary = {}
        if valid_temps:
            summary["temperature_max"] = {
                "p50": round(float(np.percentile(valid_temps, 50)), 1),
                "p75": round(float(np.percentile(valid_temps, 75)), 1),
                "p90": round(float(np.percentile(valid_temps, 90)), 1),
                "p99": round(float(np.percentile(valid_temps, 99)), 1),
                "max": round(float(np.max(valid_temps)), 1)
            }
        if valid_precips:
            summary["precipitation"] = {
                "p50": round(float(np.percentile(valid_precips, 50)), 1),
                "p75": round(float(np.percentile(valid_precips, 75)), 1),
                "p90": round(float(np.percentile(valid_precips, 90)), 1),
                "max": round(float(np.max(valid_precips)), 1)
            }
        return summary
