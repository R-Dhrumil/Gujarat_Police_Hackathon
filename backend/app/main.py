from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
from app.websockets.alerts_ws import alert_manager
import app.models # Register all models

# Initialize Database Schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Gujarat State Unified CCTV Asset Registry, GIS Mapping, Live Stream Ingestion & ANPR Analytics Platform"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Real-time WebSocket Endpoint for Live Alerts & Health Updates
@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await alert_manager.connect(websocket)
    try:
        while True:
            # Keep-alive ping/pong
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        alert_manager.disconnect(websocket)
    except Exception:
        alert_manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "platform": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_STR,
        "models_covered": [
            "Model 1: Centralized CCTV Registry & GIS Mapping",
            "Model 2: Unified Viewing & Metadata ANPR Analytics"
        ]
    }
