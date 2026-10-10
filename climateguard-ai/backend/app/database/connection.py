import logging
from typing import Optional
from backend.app.config import settings

logger = logging.getLogger("climateguard.database")

supabase_client = None

def get_supabase_client():
    global supabase_client
    if supabase_client is not None:
        return supabase_client
        
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        try:
            from supabase import create_client, Client
            supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            logger.info("Successfully connected to Supabase PostgreSQL.")
            return supabase_client
        except Exception as e:
            logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to in-memory demo repository.")
            return None
    else:
        logger.info("Supabase credentials not configured. Using local in-memory fallback repository.")
        return None

def is_supabase_configured() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY)
