from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class WatchlistBase(BaseModel):
    plate_number: str
    vehicle_owner: Optional[str] = None
    vehicle_description: Optional[str] = None
    reason: str
    category: Optional[str] = "eGujCop CCTNS Platform"
    priority: Optional[str] = "HIGH" # CRITICAL, HIGH, MEDIUM, LOW
    is_active: Optional[bool] = True
    source_database: Optional[str] = "eGujCop"
    fir_number: Optional[str] = None

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistUpdate(BaseModel):
    vehicle_owner: Optional[str] = None
    vehicle_description: Optional[str] = None
    reason: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    is_active: Optional[bool] = None
    source_database: Optional[str] = None
    fir_number: Optional[str] = None

class WatchlistOut(WatchlistBase):
    id: int
    created_by: str
    created_at: datetime
    updated_at: datetime
    match_count: Optional[int] = 0

    class Config:
        from_attributes = True
