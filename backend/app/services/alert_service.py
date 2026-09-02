from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.watchlist import Watchlist
from app.models.camera import Camera
from app.models.anpr import ANPRResult
from app.models.event import Event
from app.websockets.alerts_ws import alert_manager

async def create_and_dispatch_alert(
    db: Session,
    camera_id: int,
    alert_type: str,
    title: str,
    message: str,
    severity: str = "HIGH",
    matched_plate: Optional[str] = None,
    watchlist_id: Optional[int] = None,
    event_id: Optional[int] = None,
    snapshot_url: Optional[str] = None
) -> Alert:
    """
    Creates an alert record in the database and broadcasts it via WebSocket to all connected command center clients.
    """
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    
    alert = Alert(
        camera_id=camera_id,
        event_id=event_id,
        watchlist_id=watchlist_id,
        alert_type=alert_type,
        severity=severity,
        title=title,
        message=message,
        matched_plate=matched_plate,
        snapshot_url=snapshot_url or (camera.rtsp_url if camera else None),
        status="NEW",
        is_acknowledged=False
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Format payload for WebSocket broadcast
    alert_payload = {
        "id": alert.id,
        "alert_type": alert.alert_type,
        "severity": alert.severity,
        "title": alert.title,
        "message": alert.message,
        "matched_plate": alert.matched_plate,
        "camera_id": camera_id,
        "camera_code": camera.camera_code if camera else None,
        "camera_name": camera.name if camera else None,
        "department_name": camera.department.name if (camera and camera.department) else None,
        "district": camera.district if camera else "Ahmedabad",
        "latitude": camera.latitude if camera else 23.0225,
        "longitude": camera.longitude if camera else 72.5714,
        "hls_url": camera.hls_url if camera else None,
        "status": alert.status,
        "created_at": alert.created_at.isoformat()
    }

    # Dispatch to WebSocket
    await alert_manager.broadcast_alert(alert_payload)

    return alert

async def process_anpr_detection(
    db: Session,
    camera_id: int,
    plate_number: str,
    confidence: float = 0.94,
    vehicle_type: str = "Four-Wheeler / Car",
    vehicle_color: str = "White",
    speed_kmph: Optional[float] = None,
    snapshot_url: Optional[str] = None
) -> ANPRResult:
    """
    Stores ANPR detection metadata, checks active watchlists, and triggers automated alerts if matched.
    """
    normalized_plate = plate_number.replace(" ", "").replace("-", "").upper()
    
    # 1. Record ANPR Result
    anpr_record = ANPRResult(
        camera_id=camera_id,
        plate_number=normalized_plate,
        confidence=confidence,
        vehicle_type=vehicle_type,
        vehicle_color=vehicle_color,
        speed_kmph=speed_kmph,
        snapshot_url=snapshot_url,
        detected_at=datetime.utcnow()
    )
    db.add(anpr_record)
    db.commit()
    db.refresh(anpr_record)

    # 2. Check Watchlist
    watchlist_match = db.query(Watchlist).filter(
        Watchlist.plate_number == normalized_plate,
        Watchlist.is_active == True
    ).first()

    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    camera_label = f"{camera.name} ({camera.district})" if camera else f"Camera #{camera_id}"

    if watchlist_match:
        # Create high-priority security alert
        title = f"🚨 Watchlist Hot-Match: {normalized_plate} [{watchlist_match.priority}]"
        message = (
            f"Vehicle {normalized_plate} flagged under {watchlist_match.category} "
            f"({watchlist_match.reason}) sighted at {camera_label}. "
            f"FIR/Ref: {watchlist_match.fir_number or 'N/A'}."
        )
        
        await create_and_dispatch_alert(
            db=db,
            camera_id=camera_id,
            alert_type="WATCHLIST_MATCH",
            title=title,
            message=message,
            severity=watchlist_match.priority or "HIGH",
            matched_plate=normalized_plate,
            watchlist_id=watchlist_match.id,
            snapshot_url=snapshot_url
        )

    return anpr_record
