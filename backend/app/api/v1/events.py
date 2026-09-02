from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventOut

router = APIRouter(prefix="/events", tags=["System Events & Logging"])

def enrich_event_out(event: Event) -> EventOut:
    out = EventOut.from_orm(event)
    if event.camera:
        out.camera_code = event.camera.camera_code
        out.camera_name = event.camera.name
        if event.camera.department:
            out.department_name = event.camera.department.name
    return out

@router.get("", response_model=List[EventOut])
def get_events(
    skip: int = 0,
    limit: int = 50,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    camera_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if event_type:
        query = query.filter(Event.event_type == event_type)
    if severity:
        query = query.filter(Event.severity == severity)
    if camera_id:
        query = query.filter(Event.camera_id == camera_id)

    events = query.order_by(desc(Event.timestamp)).offset(skip).limit(limit).all()
    return [enrich_event_out(e) for e in events]
