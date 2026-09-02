from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.alert import Alert
from app.models.camera import Camera
from app.schemas.alert import AlertCreate, AlertOut, AlertAcknowledge
from app.services.alert_service import create_and_dispatch_alert
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/alerts", tags=["Real-time Alerts & Command Center"])

def enrich_alert_out(alert: Alert) -> AlertOut:
    out = AlertOut.from_orm(alert)
    if alert.camera:
        out.camera_code = alert.camera.camera_code
        out.camera_name = alert.camera.name
        out.district = alert.camera.district
        out.latitude = alert.camera.latitude
        out.longitude = alert.camera.longitude
        out.hls_url = alert.camera.hls_url
        if alert.camera.department:
            out.department_name = alert.camera.department.name
    return out

@router.get("", response_model=List[AlertOut])
def get_alerts(
    skip: int = 0,
    limit: int = 50,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    camera_id: Optional[int] = None,
    unacknowledged_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)
    if camera_id:
        query = query.filter(Alert.camera_id == camera_id)
    if unacknowledged_only:
        query = query.filter(Alert.is_acknowledged == False)

    alerts = query.order_by(desc(Alert.created_at)).offset(skip).limit(limit).all()
    return [enrich_alert_out(a) for a in alerts]

@router.get("/{id}", response_model=AlertOut)
def get_alert(id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return enrich_alert_out(alert)

@router.post("/{id}/acknowledge", response_model=AlertOut)
def acknowledge_alert(
    id: int,
    ack_data: AlertAcknowledge,
    operator_name: Optional[str] = "Control Room Operator",
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "ACKNOWLEDGED"
    alert.is_acknowledged = True
    alert.acknowledged_by = operator_name
    alert.acknowledged_at = datetime.utcnow()
    alert.resolution_notes = ack_data.resolution_notes
    db.commit()
    db.refresh(alert)

    log_audit_event(
        db=db,
        action="ALERT_ACKNOWLEDGE",
        resource_type="Alert",
        resource_id=str(alert.id),
        details=f"Alert #{alert.id} ({alert.title}) acknowledged by {operator_name}"
    )

    return enrich_alert_out(alert)

@router.post("/trigger-test", response_model=AlertOut)
async def trigger_test_alert(
    camera_id: int = Query(1),
    severity: str = Query("HIGH"),
    plate: str = Query("GJ01TEST999"),
    db: Session = Depends(get_db)
):
    """
    Triggers an instant simulated high-priority alert for demonstration/testing.
    """
    cam = db.query(Camera).filter(Camera.id == camera_id).first() or db.query(Camera).first()
    if not cam:
        raise HTTPException(status_code=400, detail="No camera found to attach test alert")

    alert = await create_and_dispatch_alert(
        db=db,
        camera_id=cam.id,
        alert_type="WATCHLIST_MATCH",
        title=f"🚨 eGujCop Intercept: Stolen Vehicle {plate}",
        message=f"Automated CCTNS match for stolen vehicle {plate} at {cam.name} ({cam.district}). Immediate tactical response dispatched.",
        severity=severity,
        matched_plate=plate
    )
    return enrich_alert_out(alert)
