from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class IndicatorDetail(BaseModel):
    score: float = Field(..., ge=0.0, le=100.0, description="Normalized score 0-100")
    raw_value: Optional[float] = None
    unit: str
    threshold_or_baseline: str
    weight: float
    contribution: float
    explanation: str

class RecommendationItem(BaseModel):
    id: str
    category: str  # heat, rainfall, dry_spell, general
    title: str
    description: str
    priority: str  # High, Medium, Low
    triggering_indicator: str
    triggering_condition: str
    supporting_source: str

class RiskAssessmentResponse(BaseModel):
    location_id: str
    location_name: str
    state: str
    assessment_timestamp: str
    data_source: str
    data_period: str
    overall_score: float = Field(..., ge=0.0, le=100.0)
    risk_level: str  # Low, Moderate, High, Unavailable
    heat_score: float = Field(..., ge=0.0, le=100.0)
    rainfall_score: float = Field(..., ge=0.0, le=100.0)
    dry_spell_score: float = Field(..., ge=0.0, le=100.0)
    indicator_details: Dict[str, IndicatorDetail]
    contributing_factors: Dict[str, Any]
    recommendations: List[RecommendationItem]
    missing_data_info: Optional[Dict[str, Any]] = None
    methodology_version: str = "v1.0-mvp"
    limitations_and_uncertainty: str
    is_demo: bool = False

class WhatIfSimulationRequest(BaseModel):
    location_id: str
    hypothetical_temp_max: Optional[float] = Field(None, ge=-20.0, le=60.0, description="Hypothetical max temperature in C")
    hypothetical_daily_rainfall: Optional[float] = Field(None, ge=0.0, le=500.0, description="Hypothetical 24h rainfall in mm")
    hypothetical_rolling_rainfall_deficit_pct: Optional[float] = Field(None, ge=-100.0, le=100.0, description="Hypothetical percentage deviation from baseline")

class WhatIfSimulationResponse(BaseModel):
    location_id: str
    location_name: str
    is_hypothetical: bool = True
    original_overall_score: float
    scenario_overall_score: float
    score_delta: float
    original_risk_level: str
    scenario_risk_level: str
    original_indicators: Dict[str, float]
    scenario_indicators: Dict[str, float]
    inputs_modified: Dict[str, Any]
    explanation: str
    disclaimer: str = "Hypothetical scenario calculation for planning only; does not overwrite actual observations."
