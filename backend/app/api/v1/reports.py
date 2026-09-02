from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.camera import Camera
from app.models.department import Department
from app.models.vms import VMSSystem
from app.models.anpr import ANPRResult
from app.models.alert import Alert
from app.models.watchlist import Watchlist
from app.schemas.reports import GapAnalysisReport, DashboardStats
from app.services.gap_analysis_service import generate_gap_analysis_report

router = APIRouter(prefix="/reports", tags=["Reports & GIS Analytics"])

@router.get("/gap-analysis", response_model=GapAnalysisReport)
def get_gap_analysis(db: Session = Depends(get_db)):
    """
    Model 1 Deliverable: Generates comprehensive GIS gap analysis report across Gujarat districts.
    """
    return generate_gap_analysis_report(db)

@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Consolidated state metrics for executive dashboard.
    """
    total_cameras = db.query(Camera).count()
    active_cameras = db.query(Camera).filter(Camera.status == "Active").count()
    offline_cameras = db.query(Camera).filter(Camera.status.in_(["Inactive", "Offline"])).count()
    maintenance_cameras = db.query(Camera).filter(Camera.status == "Maintenance").count()
    decommissioned_cameras = db.query(Camera).filter(Camera.status == "Decommissioned").count()
    
    total_depts = db.query(Department).count()
    total_vms = db.query(VMSSystem).count()
    anpr_count = db.query(ANPRResult).count()
    active_wl = db.query(Watchlist).filter(Watchlist.is_active == True).count()
    unack_alerts = db.query(Alert).filter(Alert.is_acknowledged == False).count()

    # Department distribution
    dept_dist = (
        db.query(
            Department.name,
            Department.code,
            Department.color,
            func.count(Camera.id).label("count")
        )
        .join(Camera, Camera.department_id == Department.id, isouter=True)
        .group_by(Department.id)
        .all()
    )
    dept_distribution = [
        {"department": row[0], "code": row[1], "color": row[2] or "#3b82f6", "camera_count": row[3]}
        for row in dept_dist
    ]

    # Camera type distribution
    type_dist = (
        db.query(Camera.camera_type, func.count(Camera.id))
        .group_by(Camera.camera_type)
        .all()
    )
    camera_type_distribution = [
        {"type": row[0] or "IP", "count": row[1]}
        for row in type_dist
    ]

    # District distribution (top 10)
    dist_dist = (
        db.query(Camera.district, func.count(Camera.id))
        .group_by(Camera.district)
        .order_by(func.count(Camera.id).desc())
        .limit(10)
        .all()
    )
    district_distribution = [
        {"district": row[0] or "Ahmedabad", "count": row[1]}
        for row in dist_dist
    ]

    return DashboardStats(
        total_cameras=total_cameras,
        active_cameras=active_cameras,
        offline_cameras=offline_cameras,
        maintenance_cameras=maintenance_cameras,
        decommissioned_cameras=decommissioned_cameras,
        total_departments=total_depts,
        total_vms_systems=total_vms,
        total_anpr_detections_24h=anpr_count,
        active_watchlist_items=active_wl,
        unacknowledged_alerts=unack_alerts,
        department_distribution=dept_distribution,
        camera_type_distribution=camera_type_distribution,
        district_distribution=district_distribution
    )
