from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class VMSSystemBase(BaseModel):
    name: str
    code: str
    department_id: int
    vendor: Optional[str] = "Generic RTSP/ONVIF"
    host: str
    port: Optional[int] = 8554
    protocol: Optional[str] = "RTSP"
    connection_status: Optional[str] = "ONLINE"
    description: Optional[str] = None
    is_active: Optional[bool] = True

class VMSSystemCreate(VMSSystemBase):
    pass

class VMSSystemUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    department_id: Optional[int] = None
    vendor: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    protocol: Optional[str] = None
    connection_status: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class VMSSystemOut(VMSSystemBase):
    id: int
    department_name: Optional[str] = None
    camera_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
