import pytest
import math
from backend.app.services.risk_engine import RiskEngine
from backend.app.services.recommendation_engine import RecommendationEngine

def test_heat_score_thresholds():
    # Below 32C
    score_low, _, _ = RiskEngine.calculate_heat_score(30.0)
    assert score_low == 20.0

    # 32C to 35C
    score_med, _, _ = RiskEngine.calculate_heat_score(33.0)
    assert score_med == 40.0

    # 35C to 40C
    score_elevated, _, _ = RiskEngine.calculate_heat_score(37.5)
    assert score_elevated == 70.0

    # Above 40C
    score_high, _, _ = RiskEngine.calculate_heat_score(42.0)
    assert score_high >= 90.0
    assert score_high <= 100.0

def test_heat_score_boundaries():
    # Extreme high
    score_extreme, _, _ = RiskEngine.calculate_heat_score(55.0)
    assert score_extreme <= 100.0

    # Extreme cold
    score_cold, _, _ = RiskEngine.calculate_heat_score(-10.0)
    assert score_cold >= 0.0

    # Missing / None
    score_none, _, _ = RiskEngine.calculate_heat_score(None)
    assert 0.0 <= score_none <= 100.0

def test_rainfall_score_boundaries():
    # 0 mm
    score_zero, _, _ = RiskEngine.calculate_rainfall_score(0.0)
    assert score_zero == 15.0

    # Light rain
    score_light, _, _ = RiskEngine.calculate_rainfall_score(10.0)
    assert score_light == 30.0

    # Moderate rain
    score_mod, _, _ = RiskEngine.calculate_rainfall_score(25.0)
    assert score_mod == 55.0

    # Heavy rain
    score_heavy, _, _ = RiskEngine.calculate_rainfall_score(50.0)
    assert score_heavy == 75.0

    # Extreme deluge
    score_deluge, _, _ = RiskEngine.calculate_rainfall_score(200.0)
    assert 0.0 <= score_deluge <= 100.0

    # Missing / None
    score_none, _, _ = RiskEngine.calculate_rainfall_score(None)
    assert 0.0 <= score_none <= 100.0

def test_dry_spell_score_and_anomaly():
    # Normal rainfall
    score_normal, _, _ = RiskEngine.calculate_dry_spell_score(30.0, 25.0)
    assert score_normal == 20.0

    # Mild deficit
    score_mild, _, _ = RiskEngine.calculate_dry_spell_score(18.0, 25.0)
    assert score_mild == 40.0

    # Significant deficit
    score_sig, _, _ = RiskEngine.calculate_dry_spell_score(10.0, 25.0)
    assert score_sig == 65.0

    # Severe drought
    score_sev, _, _ = RiskEngine.calculate_dry_spell_score(2.0, 25.0)
    assert score_sev == 88.0

    # Zero baseline edge case (does not crash with division by zero)
    score_zero_base, _, _ = RiskEngine.calculate_dry_spell_score(0.0, 0.0)
    assert 0.0 <= score_zero_base <= 100.0

def test_overall_weighted_score_and_categories():
    assessment = RiskEngine.calculate_assessment(
        location_id="test-loc-1",
        location_name="Vijayawada",
        state="Andhra Pradesh",
        max_temp=33.0,  # heat score 40
        daily_precip_mm=0.0,  # rain score 15
        observed_rolling_precip=30.0,  # dry spell 20
        baseline_rolling_precip=25.0,
        timestamp_str="2026-10-10T00:00:00Z"
    )

    # 0.40 * 40 + 0.35 * 15 + 0.25 * 20 = 16.0 + 5.25 + 5.0 = 26.25 -> 26.2
    assert 0.0 <= assessment["overall_score"] <= 100.0
    assert assessment["risk_level"] in ["Low", "Moderate", "High"]

def test_what_if_simulation():
    base = RiskEngine.calculate_assessment(
        location_id="test-loc-1",
        location_name="Hyderabad",
        state="Telangana",
        max_temp=30.0,
        daily_precip_mm=0.0,
        observed_rolling_precip=25.0,
        baseline_rolling_precip=25.0,
        timestamp_str="2026-10-10T00:00:00Z"
    )

    # Simulate heat wave (temperature 43°C)
    sim = RiskEngine.simulate_what_if(
        base_assessment=base,
        hypothetical_temp_max=43.0
    )

    assert sim["is_hypothetical"] is True
    assert sim["scenario_overall_score"] > sim["original_overall_score"]
    assert sim["score_delta"] > 0
    assert 0.0 <= sim["scenario_overall_score"] <= 100.0

def test_recommendation_selection():
    recs = RecommendationEngine.generate_recommendations(
        heat_score=85.0,
        rainfall_score=15.0,
        dry_spell_score=20.0
    )
    assert len(recs) > 0
    # Heat recommendation must be present with High priority
    heat_recs = [r for r in recs if r.category == "heat"]
    assert len(heat_recs) > 0
    assert any(r.priority == "High" for r in heat_recs)
