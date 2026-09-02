from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True) # ANPR_DETECTED, VEHICLE_DETECTED, CAMERA_OFFLINE, CONGESTION, INTRUSION
    severity = Column(String(30), default="INFO", index=True) # INFO, LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, default=0.95)
    description = Column(Text, nullable=True)
    extra_data = Column(JSON, nullable=True)
    snapshot_url = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    camera = relationship("Camera", back_populates="events")
    alerts = relationship("Alert", back_populates="event", cascade="all, delete-orphan")
