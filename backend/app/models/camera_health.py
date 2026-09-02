from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class CameraHealth(Base):
    __tablename__ = "camera_health"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    status = Column(String(30), default="LIVE", index=True) # LIVE, OFFLINE, RECONNECTING, MAINTENANCE, UNKNOWN
    latency_ms = Column(Float, default=45.0)
    packet_loss_percent = Column(Float, default=0.0)
    fps_actual = Column(Float, default=25.0)
    last_seen = Column(DateTime, default=datetime.utcnow)
    last_error = Column(Text, nullable=True)
    check_timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship
    camera = relationship("Camera", back_populates="health_records")
