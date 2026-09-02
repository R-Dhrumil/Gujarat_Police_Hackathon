import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Gujarat State Unified CCTV & GIS Platform"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "gujarat_police_hackathon_super_secret_jwt_key_2026_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    # Defaults to SQLite for immediate local execution, can be swapped for PostgreSQL+PostGIS in .env
    DATABASE_URL: str = Field(
        default="sqlite:///./cctv_registry.db",
        env="DATABASE_URL"
    )
    
    # Hackathon Camera Grid Ingest host (e.g. http://192.168.1.100 or http://localhost:8080)
    GRID_HOST: str = Field(default="http://localhost:8080", env="GRID_HOST")
    GRID_CATALOGUE_PATH: str = "/api/ingest"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Default Map Center (Gujarat - Gandhinagar / Ahmedabad)
    DEFAULT_MAP_LAT: float = 23.2156
    DEFAULT_MAP_LNG: float = 72.6369
    DEFAULT_MAP_ZOOM: int = 8

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
