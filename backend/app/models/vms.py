from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class VMSSystem(Base):
    __tablename__ = "vms_systems"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    vendor = Column(String(100), default="Generic RTSP/ONVIF") # Milestone, Hikvision, Dahua, Genetec, Matrix
    host = Column(String(150), nullable=False)
    port = Column(Integer, default=8554)
    protocol = Column(String(30), default="RTSP") # RTSP, ONVIF, HTTP
    connection_status = Column(String(30), default="ONLINE") # ONLINE, OFFLINE, DEGRADED
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="vms_systems")
    cameras = relationship("Camera", back_populates="vms")
