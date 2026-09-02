import math
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.camera import Camera
from app.schemas.reports import GapAnalysisReport, DistrictCoverageStats

# Major Gujarat Administrative & Strategic Districts with baseline benchmark target counts
GUJARAT_DISTRICT_BENCHMARKS = {
    "Ahmedabad": {"benchmark": 1200, "area_sqkm": 8086, "zone": "Central Gujarat", "type": "Metro City / Urban Hub"},
    "Surat": {"benchmark": 1000, "area_sqkm": 7657, "zone": "South Gujarat", "type": "Industrial / Coastal Hub"},
    "Vadodara": {"benchmark": 700, "area_sqkm": 7794, "zone": "Central Gujarat", "type": "Urban / Commercial Corridor"},
    "Rajkot": {"benchmark": 650, "area_sqkm": 11203, "zone": "Saurashtra", "type": "Commercial / Regional Hub"},
    "Gandhinagar": {"benchmark": 400, "area_sqkm": 2163, "zone": "Central Gujarat", "type": "State Capital & High Security"},
    "Valsad": {"benchmark": 300, "area_sqkm": 3034, "zone": "South Gujarat", "type": "Interstate Border (MH Border) & Coastal"},
    "Dahod": {"benchmark": 250, "area_sqkm": 3642, "zone": "East Gujarat", "type": "Tribal / Interstate Border (MP Border)"},
    "Gir Somnath": {"benchmark": 250, "area_sqkm": 3754, "zone": "Saurashtra", "type": "Pilgrimage / Coastal Security (Somnath)"},
    "Devbhumi Dwarka": {"benchmark": 250, "area_sqkm": 4051, "zone": "Saurashtra", "type": "Pilgrimage / Coastal Security (Dwarka)"},
    "Jamnagar": {"benchmark": 350, "area_sqkm": 14184, "zone": "Saurashtra", "type": "Strategic Refining & Defense Port"},
    "Bhavnagar": {"benchmark": 350, "area_sqkm": 8334, "zone": "Saurashtra", "type": "Port & Shipbreaking (Alang)"},
    "Kutch (Bhuj)": {"benchmark": 500, "area_sqkm": 45674, "zone": "Kutch Border", "type": "International Border / Port Infrastructure"},
    "Banaskantha": {"benchmark": 300, "area_sqkm": 10751, "zone": "North Gujarat", "type": "Border / Highway Corridor"},
    "Patan": {"benchmark": 200, "area_sqkm": 5740, "zone": "North Gujarat", "type": "Heritage / Rural Hub"},
    "Mehsana": {"benchmark": 300, "area_sqkm": 4386, "zone": "North Gujarat", "type": "Oil Extraction & Industrial"},
    "Sabarkantha": {"benchmark": 200, "area_sqkm": 4173, "zone": "North Gujarat", "type": "Forest & Interstate Border"},
    "Anand": {"benchmark": 300, "area_sqkm": 2951, "zone": "Central Gujarat", "type": "Agricultural & Dairy Hub"},
    "Kheda": {"benchmark": 250, "area_sqkm": 3959, "zone": "Central Gujarat", "type": "Transport Corridor"},
    "Panchmahal": {"benchmark": 200, "area_sqkm": 3272, "zone": "East Gujarat", "type": "Industrial & Heritage"},
    "Bharuch": {"benchmark": 350, "area_sqkm": 6524, "zone": "South Gujarat", "type": "Chemical & Industrial Hub (Dahej)"},
    "Narmada": {"benchmark": 200, "area_sqkm": 2749, "zone": "East Gujarat", "type": "Statue of Unity & Tourism"},
    "Navsari": {"benchmark": 250, "area_sqkm": 2211, "zone": "South Gujarat", "type": "Coastal & Agricultural"},
    "Dang": {"benchmark": 150, "area_sqkm": 1764, "zone": "South Gujarat", "type": "Tribal / Dense Forest"},
    "Porbandar": {"benchmark": 200, "area_sqkm": 2298, "zone": "Saurashtra", "type": "Coastal & Marine Security"},
    "Junagadh": {"benchmark": 300, "area_sqkm": 8831, "zone": "Saurashtra", "type": "Forest (Gir Lions) & Pilgrimage"},
    "Amreli": {"benchmark": 200, "area_sqkm": 7397, "zone": "Saurashtra", "type": "Port / Coastal / Rural"}
}

def generate_gap_analysis_report(db: Session) -> GapAnalysisReport:
    """
    Analyzes camera density and coverage gaps across all 26+ districts of Gujarat.
    """
    total_cameras = db.query(Camera).count()
    all_cameras = db.query(Camera).all()
    
    district_map = {}
    for cam in all_cameras:
        dist = cam.district or "Ahmedabad"
        if dist not in district_map:
            district_map[dist] = {"total": 0, "active": 0, "offline": 0}
        district_map[dist]["total"] += 1
        if cam.status == "Active":
            district_map[dist]["active"] += 1
        else:
            district_map[dist]["offline"] += 1

    district_stats_list: List[DistrictCoverageStats] = []
    high_cov = 0
    mod_cov = 0
    crit_gap = 0
    total_score = 0.0

    uncovered_hotspots = []

    for dist_name, meta in GUJARAT_DISTRICT_BENCHMARKS.items():
        data = district_map.get(dist_name, {"total": 0, "active": 0, "offline": 0})
        total_c = data["total"]
        active_c = data["active"]
        offline_c = data["offline"]
        benchmark = meta["benchmark"]

        # Calculate coverage score as percentage of target benchmark (capped at 100)
        coverage_pct = min(100.0, round((active_c / max(benchmark * 0.1, 1)) * 100.0, 1))
        
        # In a realistic simulation, scale based on target
        scaled_pct = min(100.0, round((total_c / max(benchmark * 0.15, 1)) * 100.0, 1))
        
        if scaled_pct >= 75.0:
            gap_level = "HIGH_DENSITY"
            high_cov += 1
            rec_cams = 10
        elif scaled_pct >= 40.0:
            gap_level = "MODERATE_GAP"
            mod_cov += 1
            rec_cams = max(20, int((benchmark * 0.15) - total_c))
        else:
            gap_level = "CRITICAL_GAP"
            crit_gap += 1
            rec_cams = max(50, int((benchmark * 0.2) - total_c))
            uncovered_hotspots.append({
                "district": dist_name,
                "zone": meta["zone"],
                "type": meta["type"],
                "current_cameras": total_c,
                "recommended_addition": rec_cams,
                "urgency": "HIGH"
            })

        total_score += scaled_pct

        district_stats_list.append(
            DistrictCoverageStats(
                district=dist_name,
                camera_count=total_c,
                active_count=active_c,
                offline_count=offline_c,
                coverage_score_percent=scaled_pct,
                gap_level=gap_level,
                recommended_new_cameras=rec_cams,
                uncovered_hotspots=[f"{dist_name} Inter-district Checkpoint", f"{dist_name} Main Transit Hub"]
            )
        )

    district_stats_list.sort(key=lambda x: x.coverage_score_percent)

    state_avg_index = round(total_score / len(GUJARAT_DISTRICT_BENCHMARKS), 1)

    recommendations = [
        "Priority 1: Deploy ANPR-enabled high-speed PTZ cameras at Dahod & Valsad interstate border corridors.",
        "Priority 2: Enhance coastal security surveillance grids across Dwarka, Somnath, and Porbandar marine stretches.",
        "Priority 3: Upgrade aging analog cameras in Food & Civil Supplies godowns to unified IP cameras.",
        "Priority 4: Establish automated GIS geo-fencing for RTO check-posts to track commercial freight movement seamlessly.",
        "Priority 5: Integrate municipal smart city surveillance feeds from AMC and SMC with eGujCop CCTNS databases."
    ]

    return GapAnalysisReport(
        total_cameras=total_cameras,
        total_districts_monitored=len([d for d in district_stats_list if d.camera_count > 0]),
        high_coverage_districts=high_cov,
        moderate_coverage_districts=mod_cov,
        critical_gap_districts=crit_gap,
        state_coverage_index=state_avg_index,
        districts=district_stats_list,
        critical_uncovered_zones=uncovered_hotspots,
        recommendations=recommendations
    )
