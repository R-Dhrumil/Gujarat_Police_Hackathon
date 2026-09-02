import io
import math
from typing import List, Optional
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.camera import Camera
from app.models.department import Department
from app.models.vms import VMSSystem
from app.schemas.camera import (
    CameraCreate,
    CameraUpdate,
    CameraOut,
    CameraGeoJSON,
    CameraGeoFeature
)
from app.schemas.bulk_import import (
    BulkImportPreview,
    BulkImportConfirmRequest,
    BulkImportResult
)
from app.services.bulk_import_service import (
    parse_file_to_dataframe,
    validate_bulk_camera_rows,
    commit_bulk_import_rows
)
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/cameras", tags=["Cameras & GIS Registry"])

def enrich_camera_out(cam: Camera) -> CameraOut:
    c_out = CameraOut.from_orm(cam)
    if cam.department:
        c_out.department_name = cam.department.name
        c_out.department_code = cam.department.code
        c_out.department_color = cam.department.color
    if cam.vms:
        c_out.vms_name = cam.vms.name
    c_out.live_health_status = "LIVE" if cam.status == "Active" else "OFFLINE"
    return c_out

@router.get("", response_model=List[CameraOut])
def get_cameras(
    skip: int = 0,
    limit: int = 500,
    department_id: Optional[int] = None,
    camera_type: Optional[str] = None,
    status: Optional[str] = None,
    district: Optional[str] = None,
    ownership: Optional[str] = None,
    analytics_only: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Camera)

    if department_id:
        query = query.filter(Camera.department_id == department_id)
    if camera_type:
        query = query.filter(Camera.camera_type == camera_type)
    if status:
        query = query.filter(Camera.status == status)
    if district:
        query = query.filter(Camera.district == district)
    if ownership:
        query = query.filter(Camera.ownership == ownership)
    if analytics_only:
        query = query.filter((Camera.analytics_enabled == True) | (Camera.anpr_enabled == True))
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Camera.name.ilike(s)) |
            (Camera.camera_code.ilike(s)) |
            (Camera.district.ilike(s)) |
            (Camera.landmark_address.ilike(s))
        )

    cameras = query.offset(skip).limit(limit).all()
    return [enrich_camera_out(c) for c in cameras]

@router.get("/geojson", response_model=CameraGeoJSON)
def get_cameras_geojson(
    department_id: Optional[int] = None,
    camera_type: Optional[str] = None,
    status: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns GIS GeoJSON FeatureCollection optimized for Leaflet map layers.
    """
    query = db.query(Camera)
    if department_id:
        query = query.filter(Camera.department_id == department_id)
    if camera_type:
        query = query.filter(Camera.camera_type == camera_type)
    if status:
        query = query.filter(Camera.status == status)
    if district:
        query = query.filter(Camera.district == district)

    cameras = query.all()
    features = []

    for cam in cameras:
        dept_name = cam.department.name if cam.department else "Unknown"
        dept_color = cam.department.color if cam.department else "#3b82f6"
        
        feature = CameraGeoFeature(
            type="Feature",
            geometry={
                "type": "Point",
                "coordinates": [cam.longitude, cam.latitude]
            },
            properties={
                "id": cam.id,
                "camera_code": cam.camera_code,
                "name": cam.name,
                "department_id": cam.department_id,
                "department_name": dept_name,
                "department_color": dept_color,
                "district": cam.district,
                "city": cam.city,
                "landmark_address": cam.landmark_address,
                "camera_type": cam.camera_type,
                "status": cam.status,
                "connectivity_status": cam.connectivity_status,
                "coverage_radius_meters": cam.coverage_radius_meters,
                "hls_url": cam.hls_url,
                "whep_url": cam.whep_url,
                "rtsp_url": cam.rtsp_url,
                "analytics_enabled": cam.analytics_enabled,
                "anpr_enabled": cam.anpr_enabled
            }
        )
        features.append(feature)

    return CameraGeoJSON(type="FeatureCollection", features=features)

@router.get("/nearby", response_model=List[CameraOut])
def get_nearby_cameras(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lng: float = Query(..., ge=-180.0, le=180.0),
    radius_km: float = Query(5.0, gt=0, le=100.0),
    db: Session = Depends(get_db)
):
    """
    Spatial radius query (Haversine distance calculation in Python for portable cross-DB compatibility).
    """
    cameras = db.query(Camera).all()
    results = []

    for cam in cameras:
        # Haversine formula
        d_lat = math.radians(cam.latitude - lat)
        d_lng = math.radians(cam.longitude - lng)
        a = (
            math.sin(d_lat / 2) ** 2 +
            math.cos(math.radians(lat)) * math.cos(math.radians(cam.latitude)) * math.sin(d_lng / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance_km = 6371.0 * c # Earth radius in km

        if distance_km <= radius_km:
            enriched = enrich_camera_out(cam)
            results.append(enriched)

    return results

@router.get("/export")
def export_cameras_csv(
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Exports camera metadata to CSV file.
    """
    query = db.query(Camera)
    if department_id:
        query = query.filter(Camera.department_id == department_id)
    if status:
        query = query.filter(Camera.status == status)

    cameras = query.all()
    records = []
    for c in cameras:
        records.append({
            "camera_code": c.camera_code,
            "name": c.name,
            "department": c.department.name if c.department else "",
            "district": c.district,
            "city": c.city,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "camera_type": c.camera_type,
            "ownership": c.ownership,
            "status": c.status,
            "storage_type": c.storage_type,
            "retention_days": c.retention_days,
            "installation_date": c.installation_date,
            "landmark_address": c.landmark_address or ""
        })

    df = pd.DataFrame(records)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=gujarat_cctv_registry.csv"
    return response

@router.get("/{id}", response_model=CameraOut)
def get_camera(id: int, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    return enrich_camera_out(cam)

@router.post("", response_model=CameraOut)
def create_camera(cam_in: CameraCreate, db: Session = Depends(get_db)):
    existing = db.query(Camera).filter(Camera.camera_code == cam_in.camera_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Camera code already exists")
    
    dept = db.query(Department).filter(Department.id == cam_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=400, detail="Invalid department ID")

    cam = Camera(**cam_in.dict())
    db.add(cam)
    db.commit()
    db.refresh(cam)

    log_audit_event(
        db=db,
        action="CAMERA_CREATE",
        resource_type="Camera",
        resource_id=str(cam.id),
        details=f"Created camera {cam.camera_code} ({cam.name}) in {cam.district}"
    )

    return enrich_camera_out(cam)

@router.put("/{id}", response_model=CameraOut)
def update_camera(id: int, cam_in: CameraUpdate, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")

    update_data = cam_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(cam, field, val)

    db.commit()
    db.refresh(cam)

    log_audit_event(
        db=db,
        action="CAMERA_UPDATE",
        resource_type="Camera",
        resource_id=str(cam.id),
        details=f"Updated camera {cam.camera_code}"
    )

    return enrich_camera_out(cam)

@router.delete("/{id}")
def delete_camera(id: int, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")

    cam_code = cam.camera_code
    db.delete(cam)
    db.commit()

    log_audit_event(
        db=db,
        action="CAMERA_DELETE",
        resource_type="Camera",
        resource_id=str(id),
        details=f"Deleted camera {cam_code}"
    )

    return {"success": True, "message": f"Camera {cam_code} deleted successfully"}

# ----------------- Bulk Import Endpoints ----------------- #

@router.post("/bulk-import/preview", response_model=BulkImportPreview)
async def bulk_import_preview(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Step 1 of Bulk Import: Uploads CSV/Excel and returns parsed preview with validation results.
    """
    contents = await file.read()
    try:
        df = parse_file_to_dataframe(contents, file.filename)
        preview = validate_bulk_camera_rows(df, db)
        return preview
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File validation failed: {str(e)}")

@router.post("/bulk-import/confirm", response_model=BulkImportResult)
def bulk_import_confirm(
    request: BulkImportConfirmRequest,
    db: Session = Depends(get_db)
):
    """
    Step 2 of Bulk Import: Commits verified rows to the database.
    """
    default_dept_id = request.default_department_id or 1
    result = commit_bulk_import_rows(
        rows=request.rows,
        auto_create_departments=request.auto_create_departments,
        default_department_id=default_dept_id,
        db=db
    )

    log_audit_event(
        db=db,
        action="CAMERA_BULK_IMPORT",
        resource_type="Camera",
        details=f"Bulk imported {result.inserted_count} new cameras, updated {result.updated_count}"
    )

    return result
