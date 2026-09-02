from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.camera import Camera
from app.services.anpr_service import start_anpr_for_camera, stop_anpr_for_camera
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/streams", tags=["Live Streams & Video Gateway"])

@router.get("/{camera_id}")
def get_stream_urls(camera_id: int, db: Session = Depends(get_db)):
    """
    Returns client-safe stream URLs for the browser (HLS, WHEP WebRTC) and RTSP for AI inference.
    """
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")

    stream_id = cam.grid_stream_id or str(cam.id)
    hls_url = cam.hls_url or f"{settings.GRID_HOST}/live/stream/{stream_id}/index.m3u8"
    whep_url = cam.whep_url or f"{settings.GRID_HOST.replace(':8080', ':8889')}/stream/{stream_id}/whep"
    rtsp_url = cam.rtsp_url or f"rtsp://{settings.GRID_HOST.split('://')[-1].split(':')[0]}:8554/stream/{stream_id}"

    return {
        "camera_id": cam.id,
        "camera_code": cam.camera_code,
        "name": cam.name,
        "department_name": cam.department.name if cam.department else "Gujarat Police",
        "status": cam.status,
        "codec": cam.codec or "H.264",
        "resolution": cam.resolution or "1080p",
        "hls_url": hls_url,
        "whep_url": whep_url,
        "rtsp_url": rtsp_url, # Intended for AI inference pipelines
        "analytics_enabled": cam.analytics_enabled,
        "anpr_enabled": cam.anpr_enabled
    }

@router.post("/{camera_id}/start-analytics")
def enable_camera_analytics(camera_id: int, db: Session = Depends(get_db)):
    """
    Enables ANPR / AI analytics on this camera RTSP stream using TCP transport.
    """
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")

    cam.analytics_enabled = True
    cam.anpr_enabled = True
    db.commit()

    rtsp_url = cam.rtsp_url or f"rtsp://{settings.GRID_HOST.split('://')[-1].split(':')[0]}:8554/stream/{cam.grid_stream_id or cam.id}"
    start_anpr_for_camera(camera_id=cam.id, rtsp_url=rtsp_url)

    log_audit_event(
        db=db,
        action="ANALYTICS_ENABLE",
        resource_type="Camera",
        resource_id=str(cam.id),
        details=f"Enabled real-time ANPR analytics on camera {cam.camera_code}"
    )

    return {"success": True, "message": f"ANPR analytics enabled for {cam.camera_code}"}

@router.post("/{camera_id}/stop-analytics")
def disable_camera_analytics(camera_id: int, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")

    cam.analytics_enabled = False
    cam.anpr_enabled = False
    db.commit()

    stop_anpr_for_camera(camera_id=cam.id)

    log_audit_event(
        db=db,
        action="ANALYTICS_DISABLE",
        resource_type="Camera",
        resource_id=str(cam.id),
        details=f"Disabled ANPR analytics on camera {cam.camera_code}"
    )

    return {"success": True, "message": f"ANPR analytics stopped for {cam.camera_code}"}
