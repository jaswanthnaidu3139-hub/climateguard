from typing import Dict, Any, Optional, Tuple
import math

class RiskEngine:
    # Configurable weights
    HEAT_WEIGHT = 0.40
    RAINFALL_WEIGHT = 0.35
    DRY_SPELL_WEIGHT = 0.25
    EPSILON = 1.0  # Safe numerical divisor

    @staticmethod
    def calculate_heat_score(max_temp: Optional[float]) -> Tuple[float, str, str]:
        """
        Calculates heat risk indicator score between 0 and 100 based on daily max temperature.
        Thresholds:
        - Below 32°C: 20
        - 32°C to < 35°C: 40
        - 35°C to 40°C: 70
        - Above 40°C: 90 (up to 100)
        """
        if max_temp is None or math.isnan(max_temp):
            return 25.0, "Historical regional average used (data missing)", "Missing daily max temperature"

        if max_temp < 32.0:
            score = 20.0
            factor = f"Temperature {max_temp:.1f}°C is below thermal stress threshold (32°C)."
        elif 32.0 <= max_temp < 35.0:
            score = 40.0
            factor = f"Temperature {max_temp:.1f}°C indicates moderate warmth (32°C–35°C)."
        elif 35.0 <= max_temp <= 40.0:
            score = 70.0
            factor = f"Temperature {max_temp:.1f}°C presents elevated heat stress conditions (35°C–40°C)."
        else:
            # Over 40°C
            score = min(100.0, 90.0 + (max_temp - 40.0) * 2.0)
            factor = f"Extreme temperature {max_temp:.1f}°C exceeds 40°C threshold."

        threshold_desc = "Thresholds: <32°C (20), 32-35°C (40), 35-40°C (70), >40°C (90+)"
        return round(score, 1), threshold_desc, factor

    @staticmethod
    def calculate_rainfall_score(daily_precip_mm: Optional[float], historical_p90_mm: float = 35.0) -> Tuple[float, str, str]:
        """
        Calculates heavy rainfall indicator score between 0 and 100.
        Normalized based on daily precipitation volume vs threshold.
        """
        if daily_precip_mm is None or math.isnan(daily_precip_mm):
            return 20.0, "Baseline assumption (data missing)", "Precipitation observation unavailable"

        if daily_precip_mm <= 1.0:
            score = 15.0
            factor = f"Precipitation is minimal ({daily_precip_mm:.1f} mm)."
        elif daily_precip_mm <= 15.0:
            score = 30.0
            factor = f"Light to moderate rainfall observed ({daily_precip_mm:.1f} mm)."
        elif daily_precip_mm <= 35.0:
            score = 55.0
            factor = f"Substantial rainfall ({daily_precip_mm:.1f} mm); normal urban runoff."
        elif daily_precip_mm <= 65.0:
            score = 75.0
            factor = f"Heavy rainfall ({daily_precip_mm:.1f} mm); risk of localized surface waterlogging."
        else:
            score = min(100.0, 90.0 + (daily_precip_mm - 65.0) * 0.2)
            factor = f"Very heavy downpour ({daily_precip_mm:.1f} mm); high runoff and drainage stress."

        threshold_desc = "Thresholds: <=1mm (15), 1-15mm (30), 15-35mm (55), 35-65mm (75), >65mm (90+)"
        return round(score, 1), threshold_desc, factor

    @classmethod
    def calculate_dry_spell_score(
        cls, 
        observed_rainfall_mm: Optional[float], 
        baseline_rainfall_mm: Optional[float]
    ) -> Tuple[float, str, str]:
        """
        Calculates dry-spell anomaly score between 0 and 100 using rolling period deficit:
        Anomaly = (observed - baseline) / max(baseline, epsilon)
        """
        if observed_rainfall_mm is None or baseline_rainfall_mm is None:
            return 25.0, "Seasonal baseline assumption", "Rolling precipitation records incomplete"

        # Safe anomaly calculation
        baseline_safe = max(baseline_rainfall_mm, cls.EPSILON)
        anomaly = (observed_rainfall_mm - baseline_rainfall_mm) / baseline_safe

        # Deficit is when anomaly < 0 (observed < baseline)
        if anomaly >= -0.15:
            # Normal or surplus rainfall
            score = 20.0
            factor = f"Precipitation is within normal or surplus seasonal range (anomaly: {anomaly:+.1%})."
        elif -0.40 <= anomaly < -0.15:
            score = 40.0
            factor = f"Mild rainfall deficit observed ({abs(anomaly):.1%} below seasonal expectation)."
        elif -0.70 <= anomaly < -0.40:
            score = 65.0
            factor = f"Significant precipitation deficit ({abs(anomaly):.1%} below baseline); dry conditions accumulating."
        else:
            score = 88.0
            factor = f"Severe dry spell detected ({abs(anomaly):.1%} deficit compared to seasonal baseline)."

        threshold_desc = "Anomaly = (Obs - Base) / max(Base, 1.0). Normal: >= -15% (20), Mild: -15% to -40% (40), Significant: -40% to -70% (65), Severe: < -70% (88+)"
        return round(score, 1), threshold_desc, factor

    @classmethod
    def determine_risk_category(cls, score: float) -> str:
        if score < 30.0:
            return "Low"
        elif 30.0 <= score < 60.0:
            return "Moderate"
        else:
            return "High"

    @classmethod
    def calculate_assessment(
        cls,
        location_id: str,
        location_name: str,
        state: str,
        max_temp: Optional[float],
        daily_precip_mm: Optional[float],
        observed_rolling_precip: Optional[float],
        baseline_rolling_precip: Optional[float],
        timestamp_str: str,
        data_source: str = "Open-Meteo",
        is_demo: bool = False
    ) -> Dict[str, Any]:
        heat_score, heat_thresh, heat_factor = cls.calculate_heat_score(max_temp)
        rain_score, rain_thresh, rain_factor = cls.calculate_rainfall_score(daily_precip_mm)
        dry_score, dry_thresh, dry_factor = cls.calculate_dry_spell_score(observed_rolling_precip, baseline_rolling_precip)

        # Weighted calculation
        overall_score = (
            cls.HEAT_WEIGHT * heat_score +
            cls.RAINFALL_WEIGHT * rain_score +
            cls.DRY_SPELL_WEIGHT * dry_score
        )
        overall_score = round(max(0.0, min(100.0, overall_score)), 1)
        risk_level = cls.determine_risk_category(overall_score)

        indicator_details = {
            "heat": {
                "score": heat_score,
                "raw_value": max_temp,
                "unit": "°C",
                "threshold_or_baseline": heat_thresh,
                "weight": cls.HEAT_WEIGHT,
                "contribution": round(cls.HEAT_WEIGHT * heat_score, 1),
                "explanation": heat_factor
            },
            "rainfall": {
                "score": rain_score,
                "raw_value": daily_precip_mm,
                "unit": "mm",
                "threshold_or_baseline": rain_thresh,
                "weight": cls.RAINFALL_WEIGHT,
                "contribution": round(cls.RAINFALL_WEIGHT * rain_score, 1),
                "explanation": rain_factor
            },
            "dry_spell": {
                "score": dry_score,
                "raw_value": observed_rolling_precip,
                "unit": "mm (14d)",
                "threshold_or_baseline": dry_thresh,
                "weight": cls.DRY_SPELL_WEIGHT,
                "contribution": round(cls.DRY_SPELL_WEIGHT * dry_score, 1),
                "explanation": dry_factor
            }
        }

        contributing_factors = {
            "heat": heat_factor,
            "rainfall": rain_factor,
            "dry_spell": dry_factor
        }

        limitations = (
            "ClimateGuard AI risk scores are screening indicators derived from atmospheric data models. "
            "They do NOT constitute official disaster warnings or flood/drought probability forecasts. "
            "Local flood risk additionally depends on hydrology, terrain elevation, urban storm drainage, and soil saturation."
        )

        return {
            "location_id": location_id,
            "location_name": location_name,
            "state": state,
            "assessment_timestamp": timestamp_str,
            "data_source": data_source,
            "data_period": "Current Observations & 14-Day Rolling Baseline",
            "overall_score": overall_score,
            "risk_level": risk_level,
            "heat_score": heat_score,
            "rainfall_score": rain_score,
            "dry_spell_score": dry_score,
            "indicator_details": indicator_details,
            "contributing_factors": contributing_factors,
            "methodology_version": "v1.0-mvp",
            "limitations_and_uncertainty": limitations,
            "is_demo": is_demo
        }

    @classmethod
    def simulate_what_if(
        cls,
        base_assessment: Dict[str, Any],
        hypothetical_temp_max: Optional[float] = None,
        hypothetical_daily_rainfall: Optional[float] = None,
        hypothetical_rolling_rainfall_deficit_pct: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Recalculates scores under hypothetical scenario changes without persisting or overwriting real observations.
        """
        # Original scores
        orig_overall = base_assessment["overall_score"]
        orig_heat = base_assessment["heat_score"]
        orig_rain = base_assessment["rainfall_score"]
        orig_dry = base_assessment["dry_spell_score"]

        # Recalculate indicators if provided
        new_heat = orig_heat
        if hypothetical_temp_max is not None:
            new_heat, _, _ = cls.calculate_heat_score(hypothetical_temp_max)

        new_rain = orig_rain
        if hypothetical_daily_rainfall is not None:
            new_rain, _, _ = cls.calculate_rainfall_score(hypothetical_daily_rainfall)

        new_dry = orig_dry
        if hypothetical_rolling_rainfall_deficit_pct is not None:
            # Map percentage deficit (e.g. -50% means anomaly of -0.50)
            anomaly = hypothetical_rolling_rainfall_deficit_pct / 100.0
            if anomaly >= -0.15:
                new_dry = 20.0
            elif -0.40 <= anomaly < -0.15:
                new_dry = 40.0
            elif -0.70 <= anomaly < -0.40:
                new_dry = 65.0
            else:
                new_dry = 88.0

        scenario_overall = round(
            cls.HEAT_WEIGHT * new_heat +
            cls.RAINFALL_WEIGHT * new_rain +
            cls.DRY_SPELL_WEIGHT * new_dry,
            1
        )
        scenario_overall = max(0.0, min(100.0, scenario_overall))
        delta = round(scenario_overall - orig_overall, 1)

        modified_inputs = {}
        if hypothetical_temp_max is not None:
            modified_inputs["temperature_max"] = f"{hypothetical_temp_max} °C"
        if hypothetical_daily_rainfall is not None:
            modified_inputs["daily_rainfall"] = f"{hypothetical_daily_rainfall} mm"
        if hypothetical_rolling_rainfall_deficit_pct is not None:
            modified_inputs["rainfall_deficit"] = f"{hypothetical_rolling_rainfall_deficit_pct}%"

        explanation = (
            f"Hypothetical adjustments resulted in an overall risk score change of {delta:+0.1f} points "
            f"(from {orig_overall} to {scenario_overall})."
        )

        return {
            "location_id": base_assessment["location_id"],
            "location_name": base_assessment["location_name"],
            "is_hypothetical": True,
            "original_overall_score": orig_overall,
            "scenario_overall_score": scenario_overall,
            "score_delta": delta,
            "original_risk_level": base_assessment["risk_level"],
            "scenario_risk_level": cls.determine_risk_category(scenario_overall),
            "original_indicators": {
                "heat": orig_heat,
                "rainfall": orig_rain,
                "dry_spell": orig_dry
            },
            "scenario_indicators": {
                "heat": new_heat,
                "rainfall": new_rain,
                "dry_spell": new_dry
            },
            "inputs_modified": modified_inputs,
            "explanation": explanation,
            "disclaimer": "Hypothetical scenario calculation for planning only; does not overwrite actual observations."
        }
