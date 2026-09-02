from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlists.id"), nullable=True, index=True)
    
    alert_type = Column(String(50), default="WATCHLIST_MATCH", index=True) # WATCHLIST_MATCH, HEALTH_FAILURE, CAMERA_OFFLINE, CONGESTION
    severity = Column(String(30), default="HIGH", index=True) # CRITICAL, HIGH, MEDIUM, LOW
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    matched_plate = Column(String(50), nullable=True, index=True)
    
    status = Column(String(30), default="NEW", index=True) # NEW, ACKNOWLEDGED, RESOLVED, DISMISSED
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    snapshot_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    camera = relationship("Camera", back_populates="alerts")
    event = relationship("Event", back_populates="alerts")
    watchlist_item = relationship("Watchlist", back_populates="alerts")
