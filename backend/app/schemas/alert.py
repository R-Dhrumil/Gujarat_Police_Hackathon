from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class AlertBase(BaseModel):
    camera_id: int
    event_id: Optional[int] = None
    watchlist_id: Optional[int] = None
    alert_type: Optional[str] = "WATCHLIST_MATCH"
    severity: Optional[str] = "HIGH"
    title: str
    message: str
    matched_plate: Optional[str] = None
    snapshot_url: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class AlertAcknowledge(BaseModel):
    resolution_notes: Optional[str] = "Acknowledged by operator"

class AlertOut(AlertBase):
    id: int
    status: str
    is_acknowledged: bool
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    camera_code: Optional[str] = None
    camera_name: Optional[str] = None
    department_name: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hls_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
