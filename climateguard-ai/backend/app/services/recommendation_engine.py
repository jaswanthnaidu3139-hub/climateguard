from typing import List, Dict, Any
from backend.app.schemas.risk import RecommendationItem

class RecommendationEngine:
    @classmethod
    def generate_recommendations(
        cls, 
        heat_score: float, 
        rainfall_score: float, 
        dry_spell_score: float
    ) -> List[RecommendationItem]:
        recommendations: List[RecommendationItem] = []

        # Heat recommendations
        if heat_score >= 70.0:
            recommendations.append(RecommendationItem(
                id="rec-heat-high",
                category="heat",
                title="Establish Community Cooling Centers & Outdoor Work Curtailment",
                description="Coordinate with local civic bodies to open shaded public hydration spaces. Reschedule strenuous outdoor labor, construction, and agricultural tasks to morning hours before 10:30 AM.",
                priority="High",
                triggering_indicator=f"Heat Risk Indicator ({heat_score}/100)",
                triggering_condition="Maximum temperature >= 35°C (Elevated Thermal Stress)",
                supporting_source="National Disaster Management Guidelines on Heat Wave Action Plan"
            ))
            recommendations.append(RecommendationItem(
                id="rec-heat-health",
                category="heat",
                title="Community Hydration & Vulnerable Citizen Check-ins",
                description="Urge elderly and chronically ill residents to remain indoors in well-ventilated rooms. Encourage electrolyte intake and monitor for early signs of heat exhaustion.",
                priority="High",
                triggering_indicator=f"Heat Risk Indicator ({heat_score}/100)",
                triggering_condition="Thermal stress threshold exceeded",
                supporting_source="WHO Public Health Heat Advice"
            ))
        elif heat_score >= 40.0:
            recommendations.append(RecommendationItem(
                id="rec-heat-med",
                category="heat",
                title="Precautionary Hydration and Sun Protection",
                description="Carry adequate drinking water during peak sunshine hours (11:00 AM – 3:30 PM). Use umbrellas, wide-brim hats, and loose, light-colored cotton attire.",
                priority="Medium",
                triggering_indicator=f"Heat Risk Indicator ({heat_score}/100)",
                triggering_condition="Temperature between 32°C and 35°C",
                supporting_source="State Climate Action Heat Advisory"
            ))

        # Heavy rainfall recommendations
        if rainfall_score >= 70.0:
            recommendations.append(RecommendationItem(
                id="rec-rain-high",
                category="rainfall",
                title="Stormwater Ingress Precaution & Low-Lying Drainage Inspection",
                description="Inspect culverts, roadside gutters, and stormwater inlets for plastic blockages. Residents in basement units or known waterlogging zones should elevate valuable goods and electrical equipment.",
                priority="High",
                triggering_indicator=f"Heavy Rainfall Indicator ({rainfall_score}/100)",
                triggering_condition="Heavy downpour intensity >= 35mm/24h",
                supporting_source="Urban Flood Preparedness Protocol"
            ))
            recommendations.append(RecommendationItem(
                id="rec-rain-transit",
                category="rainfall",
                title="Commute & Transport Advisory",
                description="Avoid underpasses prone to flash water accumulation. Monitor state meteorological bulletins and transit authority advisories before undertaking inter-district road travel.",
                priority="Medium",
                triggering_indicator=f"Heavy Rainfall Indicator ({rainfall_score}/100)",
                triggering_condition="High runoff and localized drainage stress",
                supporting_source="Civic Transport & Traffic Guidance"
            ))
        elif rainfall_score >= 50.0:
            recommendations.append(RecommendationItem(
                id="rec-rain-med",
                category="rainfall",
                title="Rainwater Catchment Activation & Sump Clearance",
                description="Engage rooftop rainwater harvesting collection filters. Ensure domestic drain lines are clear of fallen leaves and construction silt.",
                priority="Medium",
                triggering_indicator=f"Heavy Rainfall Indicator ({rainfall_score}/100)",
                triggering_condition="Substantial rainfall >= 15mm/24h",
                supporting_source="Community Rainwater Management Guidelines"
            ))

        # Dry-spell recommendations
        if dry_spell_score >= 65.0:
            recommendations.append(RecommendationItem(
                id="rec-dry-high",
                category="dry_spell",
                title="Agricultural Moisture Conservation & Drip Irrigation Shift",
                description="Shift farmland watering schedules to micro-sprinklers or drip lines during evening hours. Apply organic mulch around crop roots to retard soil evaporation.",
                priority="High",
                triggering_indicator=f"Dry-Spell Deficit Indicator ({dry_spell_score}/100)",
                triggering_condition="Precipitation deficit >= 40% over rolling 14-day window",
                supporting_source="Agricultural Drought Mitigation Manual"
            ))
            recommendations.append(RecommendationItem(
                id="rec-dry-rationing",
                category="dry_spell",
                title="Municipal Non-Potable Water Stewardship",
                description="Restrict non-essential municipal hose-pipe washing of vehicles and paved courtyards. Prioritize greywater recycling for landscaping and garden greens.",
                priority="Medium",
                triggering_indicator=f"Dry-Spell Deficit Indicator ({dry_spell_score}/100)",
                triggering_condition="Cumulative rolling rainfall shortfall",
                supporting_source="Central Ground Water Board Conservation Code"
            ))
        elif dry_spell_score >= 40.0:
            recommendations.append(RecommendationItem(
                id="rec-dry-med",
                category="dry_spell",
                title="Routine Water Conservation & Storage Check",
                description="Verify overhead and underground storage tank float valves to eliminate overflow wastage. Track regional reservoir inflow updates.",
                priority="Low",
                triggering_indicator=f"Dry-Spell Deficit Indicator ({dry_spell_score}/100)",
                triggering_condition="Mild precipitation deficit detected",
                supporting_source="Community Water Conservation Best Practices"
            ))

        # Baseline resilience action if all scores are low
        if not recommendations:
            recommendations.append(RecommendationItem(
                id="rec-resilience-general",
                category="general",
                title="Routine Environmental Monitoring & Preparedness",
                description="Current meteorological indicators show low immediate climate stress. Maintain neighborhood rainwater storage tanks and review emergency contact directories.",
                priority="Low",
                triggering_indicator="Overall Low Risk Conditions (< 30/100)",
                triggering_condition="All indicators within standard seasonal parameters",
                supporting_source="Community Resilience Framework"
            ))

        return recommendations
