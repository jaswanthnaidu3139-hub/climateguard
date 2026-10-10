import uuid
from typing import List, Dict, Optional, Any
from datetime import datetime, timezone
from backend.app.schemas.location import Location
from backend.app.database.connection import get_supabase_client, is_supabase_configured

# Built-in fallback / seed locations
SEED_LOCATIONS: List[Dict[str, Any]] = [
    {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "name": "Vijayawada",
        "state": "Andhra Pradesh",
        "latitude": 16.5062,
        "longitude": 80.6480,
        "country": "India",
        "elevation": 11.0,
        "timezone": "Asia/Kolkata"
    },
    {
        "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        "name": "Hyderabad",
        "state": "Telangana",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "country": "India",
        "elevation": 542.0,
        "timezone": "Asia/Kolkata"
    },
    {
        "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
        "name": "Visakhapatnam",
        "state": "Andhra Pradesh",
        "latitude": 17.6868,
        "longitude": 83.2185,
        "country": "India",
        "elevation": 45.0,
        "timezone": "Asia/Kolkata"
    },
    {
        "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
        "name": "Bengaluru",
        "state": "Karnataka",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "country": "India",
        "elevation": 920.0,
        "timezone": "Asia/Kolkata"
    },
    {
        "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
        "name": "Chennai",
        "state": "Tamil Nadu",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "country": "India",
        "elevation": 6.0,
        "timezone": "Asia/Kolkata"
    },
    {
        "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
        "name": "Mumbai",
        "state": "Maharashtra",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "country": "India",
        "elevation": 14.0,
        "timezone": "Asia/Kolkata"
    },
    {
        "id": "01eebc99-9c0b-4ef8-bb6d-6bb9bd380a77",
        "name": "Delhi",
        "state": "Delhi NCR",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "country": "India",
        "elevation": 216.0,
        "timezone": "Asia/Kolkata"
    },
    {
        "id": "02eebc99-9c0b-4ef8-bb6d-6bb9bd380a88",
        "name": "Kolkata",
        "state": "West Bengal",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "country": "India",
        "elevation": 9.0,
        "timezone": "Asia/Kolkata"
    }
]

# In-memory storage for assessment history
_IN_MEMORY_RISK_HISTORY: List[Dict[str, Any]] = []

class LocationRepository:
    @staticmethod
    def get_all() -> List[Dict[str, Any]]:
        supabase = get_supabase_client()
        if supabase:
            try:
                response = supabase.table("locations").select("*").execute()
                if response.data and len(response.data) > 0:
                    return response.data
            except Exception:
                pass
        return SEED_LOCATIONS

    @staticmethod
    def get_by_id(location_id: str) -> Optional[Dict[str, Any]]:
        supabase = get_supabase_client()
        if supabase:
            try:
                response = supabase.table("locations").select("*").eq("id", location_id).execute()
                if response.data and len(response.data) > 0:
                    return response.data[0]
            except Exception:
                pass
        
        # Check seed locations
        for loc in SEED_LOCATIONS:
            if loc["id"].lower() == location_id.lower():
                return loc
        return None

class RiskRepository:
    @staticmethod
    def save_assessment(assessment: Dict[str, Any]) -> Dict[str, Any]:
        assessment_record = {
            "id": str(uuid.uuid4()),
            "location_id": assessment.get("location_id"),
            "assessed_at": assessment.get("assessment_timestamp", datetime.now(timezone.utc).isoformat()),
            "heat_score": assessment.get("heat_score"),
            "rainfall_score": assessment.get("rainfall_score"),
            "dry_spell_score": assessment.get("dry_spell_score"),
            "overall_score": assessment.get("overall_score"),
            "risk_level": assessment.get("risk_level"),
            "recommendations": assessment.get("recommendations", []),
            "contributing_factors": assessment.get("contributing_factors", {}),
            "methodology_version": assessment.get("methodology_version", "v1.0-mvp"),
            "data_source": assessment.get("data_source", "Open-Meteo"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        supabase = get_supabase_client()
        if supabase:
            try:
                supabase.table("risk_assessments").insert(assessment_record).execute()
            except Exception:
                pass
                
        # Always retain in local memory list as well for fast demo retrieval
        _IN_MEMORY_RISK_HISTORY.append(assessment_record)
        return assessment_record

    @staticmethod
    def get_history_by_location(location_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        supabase = get_supabase_client()
        if supabase:
            try:
                response = (
                    supabase.table("risk_assessments")
                    .select("*")
                    .eq("location_id", location_id)
                    .order("assessed_at", desc=True)
                    .limit(limit)
                    .execute()
                )
                if response.data:
                    return response.data
            except Exception:
                pass
                
        # Filter from in-memory history
        results = [
            item for item in _IN_MEMORY_RISK_HISTORY 
            if item.get("location_id", "").lower() == location_id.lower()
        ]
        return sorted(results, key=lambda x: x.get("assessed_at", ""), reverse=True)[:limit]
