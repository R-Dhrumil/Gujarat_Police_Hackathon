from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="OPERATOR", index=True) # SUPER_ADMIN, STATE_ADMIN, DEPARTMENT_ADMIN, OPERATOR, VIEWER
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True, index=True)
    badge_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationship
    department = relationship("Department", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
