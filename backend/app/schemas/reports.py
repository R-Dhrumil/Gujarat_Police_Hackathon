from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class DistrictCoverageStats(BaseModel):
    district: str
    camera_count: int
    active_count: int
    offline_count: int
    coverage_score_percent: float # Estimated coverage density score 0-100
    gap_level: str # CRITICAL_GAP, MODERATE_GAP, GOOD_COVERAGE, HIGH_DENSITY
    recommended_new_cameras: int
    uncovered_hotspots: List[str]

class GapAnalysisReport(BaseModel):
    total_cameras: int
    total_districts_monitored: int
    high_coverage_districts: int
    moderate_coverage_districts: int
    critical_gap_districts: int
    state_coverage_index: float # 0 - 100
    districts: List[DistrictCoverageStats]
    critical_uncovered_zones: List[Dict[str, Any]]
    recommendations: List[str]

class DashboardStats(BaseModel):
    total_cameras: int
    active_cameras: int
    offline_cameras: int
    maintenance_cameras: int
    decommissioned_cameras: int
    total_departments: int
    total_vms_systems: int
    total_anpr_detections_24h: int
    active_watchlist_items: int
    unacknowledged_alerts: int
    department_distribution: List[Dict[str, Any]]
    camera_type_distribution: List[Dict[str, Any]]
    district_distribution: List[Dict[str, Any]]
