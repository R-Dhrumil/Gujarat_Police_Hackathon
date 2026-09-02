from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    user_name: Optional[str] = "System"
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[str] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = "127.0.0.1"

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogOut(AuditLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
