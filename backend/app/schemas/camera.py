from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field

class CameraBase(BaseModel):
    camera_code: str
    name: str
    department_id: int
    vms_id: Optional[int] = None
    
    # GIS & Geographical Placement
    district: str = "Ahmedabad"
    city: str = "Ahmedabad"
    taluka: Optional[str] = None
    ward_zone: Optional[str] = None
    landmark_address: Optional[str] = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    elevation_meters: Optional[float] = 15.0
    coverage_radius_meters: Optional[float] = 75.0
    fov_angle_degrees: Optional[float] = 90.0
    heading_degrees: Optional[float] = 0.0

    # Asset & Hardware Specifications
    camera_type: Optional[str] = "IP" # IP, Analog, PTZ, Dome, Bullet, ANPR, Thermal
    ownership: Optional[str] = "Government" # Government, Public-Private, Society, Mall
    make_model: Optional[str] = "Axis / Hikvision"
    resolution: Optional[str] = "1080p (FHD)"
    lens_type: Optional[str] = "Varifocal 2.8-12mm"
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None

    # Operational Status
    status: Optional[str] = "Active" # Active, Inactive, Maintenance, Decommissioned
    connectivity_status: Optional[str] = "Connected"
    storage_type: Optional[str] = "Local NVR"
    retention_days: Optional[int] = 15
    installation_date: Optional[date] = None
    amc_vendor: Optional[str] = None
    amc_expiry_date: Optional[date] = None
    last_maintenance_date: Optional[date] = None

    # Stream & Integration (Model 2)
    grid_stream_id: Optional[str] = None
    stream_protocol: Optional[str] = "RTSP"
    rtsp_url: Optional[str] = None
    hls_url: Optional[str] = None
    whep_url: Optional[str] = None
    codec: Optional[str] = "H.264"
    fps: Optional[float] = 25.0
    bitrate_kbps: Optional[int] = 2048

    # Analytics Configuration
    analytics_enabled: Optional[bool] = False
    anpr_enabled: Optional[bool] = False
    motion_detection_enabled: Optional[bool] = True
    ptz_controllable: Optional[bool] = False

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    department_id: Optional[int] = None
    vms_id: Optional[int] = None
    district: Optional[str] = None
    city: Optional[str] = None
    taluka: Optional[str] = None
    ward_zone: Optional[str] = None
    landmark_address: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    elevation_meters: Optional[float] = None
    coverage_radius_meters: Optional[float] = None
    fov_angle_degrees: Optional[float] = None
    heading_degrees: Optional[float] = None
    camera_type: Optional[str] = None
    ownership: Optional[str] = None
    make_model: Optional[str] = None
    resolution: Optional[str] = None
    status: Optional[str] = None
    connectivity_status: Optional[str] = None
    storage_type: Optional[str] = None
    retention_days: Optional[int] = None
    installation_date: Optional[date] = None
    amc_vendor: Optional[str] = None
    amc_expiry_date: Optional[date] = None
    last_maintenance_date: Optional[date] = None
    grid_stream_id: Optional[str] = None
    rtsp_url: Optional[str] = None
    hls_url: Optional[str] = None
    whep_url: Optional[str] = None
    codec: Optional[str] = None
    fps: Optional[float] = None
    bitrate_kbps: Optional[int] = None
    analytics_enabled: Optional[bool] = None
    anpr_enabled: Optional[bool] = None
    motion_detection_enabled: Optional[bool] = None
    ptz_controllable: Optional[bool] = None

class CameraOut(CameraBase):
    id: int
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    department_color: Optional[str] = "#3b82f6"
    vms_name: Optional[str] = None
    live_health_status: Optional[str] = "LIVE"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CameraGeoFeature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict

class CameraGeoJSON(BaseModel):
    type: str = "FeatureCollection"
    features: List[CameraGeoFeature]
