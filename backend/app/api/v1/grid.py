from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.services.grid_service import fetch_grid_catalogue, sync_grid_cameras_to_db
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/grid", tags=["Hackathon Camera Grid Ingest"])

@router.get("/catalogue")
async def get_grid_catalogue(grid_host: Optional[str] = None):
    """
    Fetches live camera descriptors from hackathon grid endpoint GET /api/ingest
    """
    cameras = await fetch_grid_catalogue(grid_host)
    return {
        "status": "SUCCESS",
        "grid_host": grid_host or settings.GRID_HOST,
        "count": len(cameras),
        "cameras": cameras
    }

@router.post("/sync")
async def sync_grid_cameras(
    grid_host: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Syncs camera streams from hackathon grid catalogue into local state database.
    """
    cameras = await fetch_grid_catalogue(grid_host)
    if not cameras:
        # If external grid host is not running yet, provide helpful message
        return {
            "status": "WARNING",
            "message": f"No streams detected from {grid_host or settings.GRID_HOST}/api/ingest. Ensure the hackathon stream gateway is running.",
            "synced_stats": {"created": 0, "updated": 0, "total_synced": 0}
        }

    stats = sync_grid_cameras_to_db(cameras, db)
    log_audit_event(
        db=db,
        action="GRID_SYNC",
        resource_type="CameraGrid",
        details=f"Synced {stats['total_synced']} cameras from {grid_host or settings.GRID_HOST}"
    )

    return {
        "status": "SUCCESS",
        "message": f"Successfully synchronized {stats['total_synced']} camera feeds from state grid.",
        "synced_stats": stats
    }
