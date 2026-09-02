from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(50), unique=True, nullable=False, index=True) # Normalized
    vehicle_owner = Column(String(150), nullable=True)
    vehicle_description = Column(String(255), nullable=True)
    reason = Column(String(255), nullable=False) # Stolen Vehicle, Wanted Suspect, eGujCop FIR Match, Tax Evasion, Missing Person
    category = Column(String(100), default="eGujCop CCTNS Platform") # eGujCop, VAHAN Stolen, SARTHI, Police Intelligence
    priority = Column(String(30), default="HIGH", index=True) # CRITICAL, HIGH, MEDIUM, LOW
    is_active = Column(Boolean, default=True, index=True)
    source_database = Column(String(50), default="eGujCop") # eGujCop, VAHAN, SARTHI, AFIS/NAFIS
    fir_number = Column(String(100), nullable=True)
    created_by = Column(String(100), default="Super Admin")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    alerts = relationship("Alert", back_populates="watchlist_item")
