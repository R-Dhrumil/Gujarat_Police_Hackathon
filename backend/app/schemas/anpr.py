from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ANPRResultBase(BaseModel):
    camera_id: int
    plate_number: str
    confidence: float = 0.92
    vehicle_type: Optional[str] = "Four-Wheeler / Car"
    vehicle_color: Optional[str] = "White"
    vehicle_make: Optional[str] = "Unknown"
    speed_kmph: Optional[float] = None
    direction: Optional[str] = "Inbound"
    snapshot_url: Optional[str] = None
    plate_crop_url: Optional[str] = None
    detected_at: Optional[datetime] = None

class ANPRResultCreate(ANPRResultBase):
    pass

class ANPRResultOut(ANPRResultBase):
    id: int
    camera_code: Optional[str] = None
    camera_name: Optional[str] = None
    department_name: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_watchlist_match: Optional[bool] = False
    watchlist_reason: Optional[str] = None
    watchlist_priority: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class VehicleMovementTrack(BaseModel):
    plate_number: str
    total_sightings: int
    first_seen: datetime
    last_seen: datetime
    timeline: List[ANPRResultOut]
