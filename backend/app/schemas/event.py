from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class EventBase(BaseModel):
    camera_id: int
    event_type: str
    severity: Optional[str] = "INFO"
    confidence: Optional[float] = 0.95
    description: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None
    snapshot_url: Optional[str] = None
    timestamp: Optional[datetime] = None

class EventCreate(EventBase):
    pass

class EventOut(EventBase):
    id: int
    camera_code: Optional[str] = None
    camera_name: Optional[str] = None
    department_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
