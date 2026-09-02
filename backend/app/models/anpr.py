from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class ANPRResult(Base):
    __tablename__ = "anpr_results"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    plate_number = Column(String(50), nullable=False, index=True) # Normalized uppercase e.g. GJ01AB1234
    confidence = Column(Float, default=0.92)
    vehicle_type = Column(String(50), default="Four-Wheeler / Car", index=True) # Two-Wheeler, Car, Bus, Truck, Auto, Commercial
    vehicle_color = Column(String(50), default="White")
    vehicle_make = Column(String(50), default="Unknown")
    speed_kmph = Column(Float, nullable=True)
    direction = Column(String(30), default="Inbound") # Inbound, Outbound
    snapshot_url = Column(String(255), nullable=True)
    plate_crop_url = Column(String(255), nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    camera = relationship("Camera", back_populates="anpr_records")
