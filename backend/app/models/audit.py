from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    user_name = Column(String(100), default="System")
    action = Column(String(100), nullable=False, index=True) # CAMERA_VIEW, STREAM_START, BULK_IMPORT, WATCHLIST_CREATE, ALERT_ACKNOWLEDGE
    resource_type = Column(String(50), nullable=False, index=True) # Camera, Department, VMS, Watchlist, Alert
    resource_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    extra_metadata = Column(JSON, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship
    user = relationship("User", back_populates="audit_logs")
