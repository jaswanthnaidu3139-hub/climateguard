import logging
import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.database.connection import is_supabase_configured
from backend.app.api.routes import (
    locations,
    weather,
    history,
    risk,
    recommendations,
    comparison
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("climateguard")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Community Climate Risk Intelligence Platform API. "
        "Calculates transparent climate-risk indicators, historical anomalies, "
        "and actionable climate adaptation recommendations for community decision support."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"  # Flexible for hackathon preview testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing climate data. Please try again shortly.",
            "path": str(request.url.path)
        }
    )

# Include Routers
app.include_router(locations.router)
app.include_router(weather.router)
app.include_router(history.router)
app.include_router(risk.router)
app.include_router(recommendations.router)
app.include_router(comparison.router)

@app.get("/api/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint returning system status and service availability.
    """
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "supabase_connected": is_supabase_configured(),
        "primary_weather_provider": "Open-Meteo API",
        "timestamp": time.time()
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to ClimateGuard AI API",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
