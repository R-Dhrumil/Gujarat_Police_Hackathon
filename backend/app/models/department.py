from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True) # e.g. POLICE, RTO, AMC, FCS
    category = Column(String(50), default="Government") # Law Enforcement, Transport, Municipal, Civil
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="Shield")
    color = Column(String(30), default="#3b82f6") # Hex for map marker/badges
    contact_person = Column(String(100), nullable=True)
    contact_email = Column(String(100), nullable=True)
    contact_phone = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cameras = relationship("Camera", back_populates="department", cascade="all, delete-orphan")
    vms_systems = relationship("VMSSystem", back_populates="department", cascade="all, delete-orphan")
    users = relationship("User", back_populates="department")
