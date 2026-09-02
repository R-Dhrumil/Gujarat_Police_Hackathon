from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.anpr import ANPRResult
from app.models.camera import Camera
from app.models.watchlist import Watchlist
from app.schemas.anpr import ANPRResultCreate, ANPRResultOut, VehicleMovementTrack
from app.services.alert_service import process_anpr_detection

router = APIRouter(prefix="/anpr", tags=["ANPR & Vehicle Intelligence"])

def enrich_anpr_out(record: ANPRResult, db: Session) -> ANPRResultOut:
    out = ANPRResultOut.from_orm(record)
    if record.camera:
        out.camera_code = record.camera.camera_code
        out.camera_name = record.camera.name
        out.district = record.camera.district
        out.latitude = record.camera.latitude
        out.longitude = record.camera.longitude
        if record.camera.department:
            out.department_name = record.camera.department.name

    # Check watchlist match
    wl = db.query(Watchlist).filter(
        Watchlist.plate_number == record.plate_number,
        Watchlist.is_active == True
    ).first()
    if wl:
        out.is_watchlist_match = True
        out.watchlist_reason = wl.reason
        out.watchlist_priority = wl.priority

    return out

@router.get("/results", response_model=List[ANPRResultOut])
def search_anpr_records(
    skip: int = 0,
    limit: int = 100,
    plate_number: Optional[str] = None,
    camera_id: Optional[int] = None,
    vehicle_type: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ANPRResult)
    if plate_number:
        clean_plate = plate_number.replace(" ", "").replace("-", "").upper()
        query = query.filter(ANPRResult.plate_number.contains(clean_plate))
    if camera_id:
        query = query.filter(ANPRResult.camera_id == camera_id)
    if vehicle_type:
        query = query.filter(ANPRResult.vehicle_type == vehicle_type)
    if district:
        query = query.join(Camera).filter(Camera.district == district)

    records = query.order_by(desc(ANPRResult.detected_at)).offset(skip).limit(limit).all()
    return [enrich_anpr_out(r, db) for r in records]

@router.get("/track/{plate_number}", response_model=VehicleMovementTrack)
def track_vehicle_movement(plate_number: str, db: Session = Depends(get_db)):
    """
    Returns full chronological spatial movement trajectory for a suspect or targeted vehicle license plate.
    """
    clean_plate = plate_number.replace(" ", "").replace("-", "").upper()
    records = db.query(ANPRResult).filter(
        ANPRResult.plate_number == clean_plate
    ).order_by(ANPRResult.detected_at).all()

    if not records:
        raise HTTPException(
            status_code=404,
            detail=f"No sightings found for vehicle plate number {clean_plate}"
        )

    timeline = [enrich_anpr_out(r, db) for r in records]
    return VehicleMovementTrack(
        plate_number=clean_plate,
        total_sightings=len(records),
        first_seen=records[0].detected_at,
        last_seen=records[-1].detected_at,
        timeline=timeline
    )

@router.post("/simulate-detection", response_model=ANPRResultOut)
async def simulate_detection(
    detection: ANPRResultCreate,
    db: Session = Depends(get_db)
):
    """
    Manually submit or simulate an ANPR detection (useful for demonstration & testing)
    """
    record = await process_anpr_detection(
        db=db,
        camera_id=detection.camera_id,
        plate_number=detection.plate_number,
        confidence=detection.confidence,
        vehicle_type=detection.vehicle_type or "Four-Wheeler / Car",
        vehicle_color=detection.vehicle_color or "White",
        speed_kmph=detection.speed_kmph,
        snapshot_url=detection.snapshot_url
    )
    return enrich_anpr_out(record, db)
