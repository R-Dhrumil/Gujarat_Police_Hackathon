from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_code = Column(String(50), unique=True, nullable=False, index=True) # e.g. CAM-AHM-POL-001
    name = Column(String(150), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    vms_id = Column(Integer, ForeignKey("vms_systems.id"), nullable=True, index=True)
    
    # GIS & Geographical Placement (Model 1)
    district = Column(String(100), nullable=False, default="Ahmedabad", index=True)
    city = Column(String(100), nullable=False, default="Ahmedabad", index=True)
    taluka = Column(String(100), nullable=True)
    ward_zone = Column(String(100), nullable=True) # e.g. West Zone, Ward 12
    landmark_address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    elevation_meters = Column(Float, default=15.0)
    coverage_radius_meters = Column(Float, default=75.0) # For GIS coverage map
    fov_angle_degrees = Column(Float, default=90.0) # Field of View angle
    heading_degrees = Column(Float, default=0.0) # Azimuth compass heading (0-360)

    # Asset & Hardware Specifications (Model 1)
    camera_type = Column(String(50), default="IP", index=True) # IP, Analog, PTZ, Dome, Bullet, ANPR, Thermal
    ownership = Column(String(50), default="Government", index=True) # Government, Public-Private, Society, Mall
    make_model = Column(String(150), default="Axis / Hikvision / CP Plus")
    resolution = Column(String(30), default="1080p (FHD)") # 720p, 1080p, 2K, 4K
    lens_type = Column(String(50), default="Varifocal 2.8-12mm")
    ip_address = Column(String(50), nullable=True) # Protected metadata
    mac_address = Column(String(50), nullable=True)

    # Operational & Lifecycle Status (Model 1)
    status = Column(String(30), default="Active", index=True) # Active, Inactive, Maintenance, Decommissioned
    connectivity_status = Column(String(30), default="Connected", index=True) # Connected, Disconnected, Intermittent
    storage_type = Column(String(50), default="Local NVR") # Local NVR, Edge SD, Cloud, State DC
    retention_days = Column(Integer, default=15)
    installation_date = Column(Date, default=date.today)
    amc_vendor = Column(String(100), nullable=True)
    amc_expiry_date = Column(Date, nullable=True)
    last_maintenance_date = Column(Date, nullable=True)
    last_ping_time = Column(DateTime, default=datetime.utcnow)

    # Stream & Integration Feeds (Model 2)
    grid_stream_id = Column(String(100), nullable=True, index=True) # Ingest ID from hackathon grid
    stream_protocol = Column(String(30), default="RTSP") # RTSP, HLS, WebRTC
    rtsp_url = Column(String(255), nullable=True)
    hls_url = Column(String(255), nullable=True)
    whep_url = Column(String(255), nullable=True)
    codec = Column(String(30), default="H.264") # H.264, H.265
    fps = Column(Float, default=25.0)
    bitrate_kbps = Column(Integer, default=2048)

    # Analytics Configuration (Model 2)
    analytics_enabled = Column(Boolean, default=False, index=True)
    anpr_enabled = Column(Boolean, default=False, index=True)
    motion_detection_enabled = Column(Boolean, default=True)
    ptz_controllable = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="cameras")
    vms = relationship("VMSSystem", back_populates="cameras")
    health_records = relationship("CameraHealth", back_populates="camera", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="camera", cascade="all, delete-orphan")
    anpr_records = relationship("ANPRResult", back_populates="camera", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="camera", cascade="all, delete-orphan")
