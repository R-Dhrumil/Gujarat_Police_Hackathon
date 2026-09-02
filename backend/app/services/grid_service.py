import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.camera import Camera
from app.models.department import Department
from app.models.vms import VMSSystem
from app.models.camera_health import CameraHealth

async def fetch_grid_catalogue(grid_host: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Calls the hackathon camera grid catalogue API: GET /api/ingest
    Returns list of camera stream descriptors.
    """
    host = grid_host or settings.GRID_HOST
    url = f"{host.rstrip('/')}{settings.GRID_CATALOGUE_PATH}"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict) and "cameras" in data:
                    return data["cameras"]
                return []
            else:
                print(f"[GRID CATALOGUE WARNING] Status {response.status_code} from {url}")
                return []
    except Exception as e:
        print(f"[GRID CATALOGUE CONNECT ERROR] Could not reach {url}: {e}")
        return []

def sync_grid_cameras_to_db(grid_cameras: List[Dict[str, Any]], db: Session) -> Dict[str, int]:
    """
    Upserts camera streams discovered from the grid catalogue into the local database.
    Matches primarily by grid_stream_id or camera_code.
    """
    synced_count = 0
    created_count = 0

    # Ensure default department exists
    police_dept = db.query(Department).filter(Department.code == "POLICE").first()
    if not police_dept:
        police_dept = Department(
            name="Gujarat Police (Home Dept)",
            code="POLICE",
            category="Law Enforcement",
            color="#2563eb",
            description="Gujarat State Police & Law Enforcement Grid"
        )
        db.add(police_dept)
        db.commit()
        db.refresh(police_dept)

    # Ensure default VMS exists
    default_vms = db.query(VMSSystem).first()
    if not default_vms:
        default_vms = VMSSystem(
            name="State Unified Stream Gateway",
            code="VMS-STATE-GW-01",
            department_id=police_dept.id,
            vendor="State Media Gateway",
            host="localhost",
            port=8554,
            protocol="RTSP",
            connection_status="ONLINE"
        )
        db.add(default_vms)
        db.commit()
        db.refresh(default_vms)

    for item in grid_cameras:
        stream_id = str(item.get("id") or item.get("stream_id") or "")
        if not stream_id:
            continue

        rtsp_url = item.get("rtsp_url") or item.get("rtsp") or f"rtsp://{settings.GRID_HOST.split('://')[-1].split(':')[0]}:8554/stream/{stream_id}"
        hls_url = item.get("hls_url") or item.get("hls") or f"{settings.GRID_HOST}/live/stream/{stream_id}/index.m3u8"
        whep_url = item.get("whep_url") or item.get("whep") or f"{settings.GRID_HOST.replace(':8080', ':8889')}/stream/{stream_id}/whep"
        
        codec = str(item.get("codec") or "H.264").upper()
        resolution = str(item.get("resolution") or "1080p")
        is_live = bool(item.get("live", True) or item.get("status") == "LIVE")
        
        # Look for existing camera record
        cam = db.query(Camera).filter(
            (Camera.grid_stream_id == stream_id) | (Camera.camera_code == f"STREAM-{stream_id}")
        ).first()

        lat = float(item.get("lat") or item.get("latitude") or 23.0225)
        lon = float(item.get("lng") or item.get("lon") or item.get("longitude") or 72.5714)
        name = str(item.get("name") or item.get("location") or f"Stream Camera {stream_id}")
        district = str(item.get("district") or "Ahmedabad")

        if cam:
            # Update stream properties
            cam.rtsp_url = rtsp_url
            cam.hls_url = hls_url
            cam.whep_url = whep_url
            cam.codec = codec
            cam.resolution = resolution
            cam.status = "Active" if is_live else "Inactive"
            cam.connectivity_status = "Connected" if is_live else "Disconnected"
            synced_count += 1
        else:
            # Create new camera
            cam = Camera(
                camera_code=f"STREAM-{stream_id}",
                name=name,
                department_id=police_dept.id,
                vms_id=default_vms.id,
                grid_stream_id=stream_id,
                district=district,
                city=district,
                latitude=lat,
                longitude=lon,
                camera_type="ANPR" if "anpr" in name.lower() else "IP",
                ownership="Government",
                status="Active" if is_live else "Inactive",
                connectivity_status="Connected" if is_live else "Disconnected",
                rtsp_url=rtsp_url,
                hls_url=hls_url,
                whep_url=whep_url,
                codec=codec,
                resolution=resolution,
                analytics_enabled=True,
                anpr_enabled=True
            )
            db.add(cam)
            created_count += 1

    db.commit()
    return {"created": created_count, "updated": synced_count, "total_synced": len(grid_cameras)}
