import os
import sys
from datetime import datetime, date, timedelta

# Add parent directory to sys.path so app modules can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash, UserRole
from app.models.department import Department
from app.models.vms import VMSSystem
from app.models.camera import Camera
from app.models.watchlist import Watchlist
from app.models.anpr import ANPRResult
from app.models.alert import Alert
from app.models.user import User

# Ensure schema exists
Base.metadata.create_all(bind=engine)

# 26 Gujarat Government Departments
GUJARAT_DEPARTMENTS = [
    {"name": "Home Department (Gujarat Police)", "code": "POLICE", "category": "Law Enforcement", "color": "#2563eb", "icon": "Shield", "desc": "Public safety, traffic control, crime prevention, and CCTNS surveillance."},
    {"name": "Ports and Transport (RTO)", "code": "RTO", "category": "Transport", "color": "#0284c7", "icon": "Car", "desc": "Automated driving test tracks, interstate border check-posts, and VAHAN compliance."},
    {"name": "Amdavad Municipal Corporation (AMC)", "code": "AMC", "category": "Municipal", "color": "#0d9488", "icon": "Building2", "desc": "Smart city civic surveillance, BRTS corridors, and urban traffic monitoring."},
    {"name": "Surat Municipal Corporation (SMC)", "code": "SMC", "category": "Municipal", "color": "#059669", "icon": "Building2", "desc": "Industrial corridor, textile market surveillance, and diamond bourses."},
    {"name": "Vadodara Municipal Corporation (VMC)", "code": "VMC", "category": "Municipal", "color": "#10b981", "icon": "Building2", "desc": "Heritage city management and public transit corridors."},
    {"name": "Rajkot Municipal Corporation (RMC)", "code": "RMC", "category": "Municipal", "color": "#16a34a", "icon": "Building2", "desc": "Saurashtra commercial center and arterial transit intersections."},
    {"name": "Food, Civil Supplies & Consumer Affairs", "code": "FCS", "category": "Civil Supplies", "color": "#d97706", "icon": "Package", "desc": "State food grain godowns, PDS supply depots, and fair price shops."},
    {"name": "Health & Family Welfare Department", "code": "HEALTH", "category": "Healthcare", "color": "#e11d48", "icon": "Cross", "desc": "Civil hospitals, medical colleges, and regional drug storage warehouses."},
    {"name": "Forest and Environment Department", "code": "FOREST", "category": "Environment", "color": "#15803d", "icon": "TreePine", "desc": "Gir Lion Sanctuary, wildlife corridors, and border check-posts."},
    {"name": "Gujarat Tourism & Pilgrimage Board", "code": "TOURISM", "category": "Tourism", "color": "#ea580c", "icon": "Landmark", "desc": "Statue of Unity, Somnath Temple, Dwarka corridor, and heritage sites."},
    {"name": "Gujarat Maritime Board (GMB)", "code": "GMB", "category": "Transport", "color": "#0369a1", "icon": "Anchor", "desc": "Major non-major coastal ports, Alang shipbreaking yard, and jetties."},
    {"name": "Revenue Department", "code": "REVENUE", "category": "Administration", "color": "#7c3aed", "icon": "FileText", "desc": "Collectorates, Sub-Registrar offices, and land record centers."},
    {"name": "Roads & Buildings Department", "code": "RNB", "category": "Infrastructure", "color": "#4b5563", "icon": "Hammer", "desc": "State highways, flyovers, and major government complexes."},
    {"name": "Energy & Petrochemicals Department", "code": "ENERGY", "category": "Energy", "color": "#eab308", "icon": "Zap", "desc": "GETCO substations, solar parks, and refinery pipelines."},
    {"name": "Industries and Mines Department", "code": "MINES", "category": "Industrial", "color": "#b45309", "icon": "Pickaxe", "desc": "GIDC industrial estates and mineral transport checkpoints."},
    {"name": "Urban Development & Urban Housing", "code": "UDD", "category": "Urban", "color": "#0891b2", "icon": "Home", "desc": "Urban planning authorities and housing infrastructure."},
    {"name": "Education Department", "code": "EDU", "category": "Education", "color": "#6366f1", "icon": "GraduationCap", "desc": "State universities, examination strong-rooms, and educational hubs."},
    {"name": "Water Resources Department", "code": "WATER", "category": "Infrastructure", "color": "#06b6d4", "icon": "Droplet", "desc": "Sardar Sarovar Dam, canal networks, and water purification plants."},
    {"name": "Agriculture, Farmers Welfare & Co-operation", "code": "AGRI", "category": "Agriculture", "color": "#65a30d", "icon": "Wheat", "desc": "APMC market yards and cold storage facilities."},
    {"name": "Fisheries Department", "code": "FISH", "category": "Maritime", "color": "#0284c7", "icon": "Fish", "desc": "Fishing harbours (Veraval, Porbandar) and fish landing centers."},
    {"name": "Gujarat State Disaster Management (GSDMA)", "code": "GSDMA", "category": "Emergency", "color": "#dc2626", "icon": "AlertTriangle", "desc": "Emergency operations centers, flood monitoring, and coastal cyclone watch."},
    {"name": "Panchayats, Rural Housing & Rural Dev", "code": "PANCHAYAT", "category": "Rural", "color": "#84cc16", "icon": "Compass", "desc": "Gram panchayat Bhavan facilities and rural asset networks."},
    {"name": "Tribal Development Department", "code": "TRIBAL", "category": "Social", "color": "#a855f7", "icon": "Users", "desc": "Eklavya model residential schools and tribal area development centers."},
    {"name": "Social Justice & Empowerment", "code": "SJE", "category": "Social", "color": "#9333ea", "icon": "HeartHandshake", "desc": "Welfare residential institutes and empowerment centers."},
    {"name": "Women and Child Development", "code": "WCD", "category": "Social", "color": "#ec4899", "icon": "Smile", "desc": "Anganwadi centers and child protection facilities."},
    {"name": "Legal Department & Judiciary", "code": "LEGAL", "category": "Judiciary", "color": "#475569", "icon": "Scale", "desc": "Gujarat High Court, district courts, and central jail complexes."}
]

# Strategic VMS Systems
SAMPLE_VMS_SYSTEMS = [
    {"name": "Gujarat Police State Net VMS", "code": "VMS-POL-STATE", "dept_code": "POLICE", "vendor": "Milestone XProtect", "host": "10.200.1.10", "port": 8554, "protocol": "RTSP"},
    {"name": "Ahmedabad Smart City Traffic VMS", "code": "VMS-AMC-TRAFFIC", "dept_code": "AMC", "vendor": "Genetec Security Center", "host": "10.200.2.20", "port": 8554, "protocol": "RTSP"},
    {"name": "RTO State Checkpost Gateway", "code": "VMS-RTO-CHECKPOST", "dept_code": "RTO", "vendor": "Matrix SATATYA", "host": "10.200.3.30", "port": 8554, "protocol": "RTSP"},
    {"name": "Food & Civil Supplies Godown Net", "code": "VMS-FCS-GODOWN", "dept_code": "FCS", "vendor": "Hikvision iVMS-5200", "host": "10.200.4.40", "port": 8554, "protocol": "RTSP"},
    {"name": "Pilgrimage Coastal Security VMS", "code": "VMS-TOURISM-COAST", "dept_code": "TOURISM", "vendor": "Dahua DSS Pro", "host": "10.200.5.50", "port": 8554, "protocol": "RTSP"},
    {"name": "Surat City Diamond Corridor VMS", "code": "VMS-SMC-DIAMOND", "dept_code": "SMC", "vendor": "Axis Camera Station", "host": "10.200.6.60", "port": 8554, "protocol": "RTSP"}
]

# Sample Strategic Cameras Across Gujarat
SAMPLE_CAMERAS = [
    # Ahmedabad / Gandhinagar
    {"code": "CAM-AHM-POL-001", "name": "Income Tax Circle Traffic ANPR", "dept": "POLICE", "vms": "VMS-POL-STATE", "dist": "Ahmedabad", "lat": 23.0425, "lng": 72.5684, "type": "ANPR", "status": "Active", "stream_id": "1"},
    {"code": "CAM-AHM-POL-002", "name": "Law Garden Public Safety PTZ", "dept": "POLICE", "vms": "VMS-POL-STATE", "dist": "Ahmedabad", "lat": 23.0225, "lng": 72.5714, "type": "PTZ", "status": "Active", "stream_id": "2"},
    {"code": "CAM-AHM-AMC-003", "name": "Riverfront West Promenade Bullet", "dept": "AMC", "vms": "VMS-AMC-TRAFFIC", "dist": "Ahmedabad", "lat": 23.0305, "lng": 72.5750, "type": "Bullet", "status": "Active", "stream_id": "3"},
    {"code": "CAM-AHM-AMC-004", "name": "Shivranjani Cross Roads Multi-Sensor", "dept": "AMC", "vms": "VMS-AMC-TRAFFIC", "dist": "Ahmedabad", "lat": 23.0248, "lng": 72.5312, "type": "IP", "status": "Active", "stream_id": "4"},
    {"code": "CAM-GND-POL-005", "name": "CH-0 Circle High Security Gandhinagar", "dept": "POLICE", "vms": "VMS-POL-STATE", "dist": "Gandhinagar", "lat": 23.2156, "lng": 72.6369, "type": "ANPR", "status": "Active", "stream_id": "5"},
    {"code": "CAM-GND-POL-006", "name": "Mahatma Mandir Convention Dome", "dept": "POLICE", "vms": "VMS-POL-STATE", "dist": "Gandhinagar", "lat": 23.2280, "lng": 72.6492, "type": "Dome", "status": "Active", "stream_id": "6"},
    
    # Interstate Border Locations (Valsad & Dahod)
    {"code": "CAM-VAL-RTO-010", "name": "Valsad Bhilad MH Border Checkpost ANPR", "dept": "RTO", "vms": "VMS-RTO-CHECKPOST", "dist": "Valsad", "lat": 20.2818, "lng": 72.9106, "type": "ANPR", "status": "Active", "stream_id": "7"},
    {"code": "CAM-VAL-POL-011", "name": "Valsad Tithal Beach Coastal Security", "dept": "POLICE", "vms": "VMS-POL-STATE", "dist": "Valsad", "lat": 20.6050, "lng": 72.9015, "type": "PTZ", "status": "Active", "stream_id": "8"},
    {"code": "CAM-DAH-RTO-015", "name": "Dahod Jhalod MP Border Checkpost ANPR", "dept": "RTO", "vms": "VMS-RTO-CHECKPOST", "dist": "Dahod", "lat": 22.8360, "lng": 74.2546, "type": "ANPR", "status": "Active", "stream_id": "9"},
    {"code": "CAM-DAH-FCS-016", "name": "Dahod Central PDS Buffer Godown", "dept": "FCS", "vms": "VMS-FCS-GODOWN", "dist": "Dahod", "lat": 22.8310, "lng": 74.2500, "type": "IP", "status": "Maintenance", "stream_id": "10"},
    
    # Coastal & Pilgrimage Centers (Somnath & Dwarka)
    {"code": "CAM-SOM-TOU-020", "name": "Somnath Temple North Gate Security", "dept": "TOURISM", "vms": "VMS-TOURISM-COAST", "dist": "Gir Somnath", "lat": 20.8880, "lng": 70.4010, "type": "PTZ", "status": "Active", "stream_id": "11"},
    {"code": "CAM-SOM-POL-021", "name": "Veraval Fishing Harbour Entry Post", "dept": "POLICE", "vms": "VMS-POL-STATE", "dist": "Gir Somnath", "lat": 20.9060, "lng": 70.3680, "type": "Bullet", "status": "Active", "stream_id": "12"},
    {"code": "CAM-DWK-TOU-025", "name": "Dwarkadhish Temple Sudama Setu ANPR", "dept": "TOURISM", "vms": "VMS-TOURISM-COAST", "dist": "Devbhumi Dwarka", "lat": 22.2376, "lng": 68.9678, "type": "ANPR", "status": "Active", "stream_id": "13"},
    {"code": "CAM-DWK-POL-026", "name": "Okha Port Coastal Defense Post", "dept": "POLICE", "vms": "VMS-POL-STATE", "dist": "Devbhumi Dwarka", "lat": 22.4630, "lng": 69.0710, "type": "Thermal", "status": "Active", "stream_id": "14"},

    # Industrial & Strategic Cities (Surat, Vadodara, Rajkot, Jamnagar, Bhavnagar)
    {"code": "CAM-SRT-SMC-030", "name": "Surat Ring Road Majura Gate PTZ", "dept": "SMC", "vms": "VMS-SMC-DIAMOND", "dist": "Surat", "lat": 21.1702, "lng": 72.8311, "type": "PTZ", "status": "Active", "stream_id": "15"},
    {"code": "CAM-SRT-SMC-031", "name": "Surat Diamond Bourse High Resolution ANPR", "dept": "SMC", "vms": "VMS-SMC-DIAMOND", "dist": "Surat", "lat": 21.1350, "lng": 72.8520, "type": "ANPR", "status": "Active", "stream_id": "16"},
    {"code": "CAM-VAD-VMC-035", "name": "Vadodara Sayaji Ganj Station Approach", "dept": "VMC", "vms": "VMS-AMC-TRAFFIC", "dist": "Vadodara", "lat": 22.3072, "lng": 73.1812, "type": "IP", "status": "Active", "stream_id": "17"},
    {"code": "CAM-VAD-FCS-036", "name": "Vadodara Makarpura GIDC Godown Storage", "dept": "FCS", "vms": "VMS-FCS-GODOWN", "dist": "Vadodara", "lat": 22.2530, "lng": 73.1920, "type": "Dome", "status": "Active", "stream_id": "18"},
    {"code": "CAM-RJK-RMC-040", "name": "Rajkot Yagnik Road Commercial PTZ", "dept": "RMC", "vms": "VMS-AMC-TRAFFIC", "dist": "Rajkot", "lat": 22.3039, "lng": 70.8022, "type": "PTZ", "status": "Active", "stream_id": "19"},
    {"code": "CAM-JAM-POL-045", "name": "Jamnagar Reliance Refinery Access Highway ANPR", "dept": "POLICE", "vms": "VMS-POL-STATE", "dist": "Jamnagar", "lat": 22.4707, "lng": 70.0577, "type": "ANPR", "status": "Active", "stream_id": "20"},
    {"code": "CAM-BHV-POL-050", "name": "Bhavnagar Alang Shipbreaking Road Junction", "dept": "POLICE", "vms": "VMS-POL-STATE", "dist": "Bhavnagar", "lat": 21.7645, "lng": 72.1519, "type": "Bullet", "status": "Inactive", "stream_id": "21"},
    {"code": "CAM-KTCH-POL-055", "name": "Bhuj Khavda Border Security Watchpost", "dept": "POLICE", "vms": "VMS-POL-STATE", "dist": "Kutch (Bhuj)", "lat": 23.8340, "lng": 69.7280, "type": "Thermal", "status": "Active", "stream_id": "22"}
]

# Sample eGujCop / VAHAN Watchlist Records
SAMPLE_WATCHLIST = [
    {
        "plate": "GJ01AB1234",
        "owner": "Ramesh K. Patel",
        "desc": "White Maruti Swift 2022",
        "reason": "Stolen Vehicle Reported (eGujCop FIR #2024/491)",
        "category": "eGujCop CCTNS Platform",
        "priority": "HIGH",
        "source": "eGujCop",
        "fir": "FIR-2024-AHM-491"
    },
    {
        "plate": "GJ05CD5678",
        "owner": "Unknown Commercial Operator",
        "desc": "Yellow Tata 407 Heavy Truck",
        "reason": "Suspected Illegal Liquor Smuggling Interstate Transit",
        "category": "Police Intelligence",
        "priority": "CRITICAL",
        "source": "Police Special Operation Group",
        "fir": "SOG-VAL-2024-88"
    },
    {
        "plate": "GJ27EF9012",
        "owner": "Vikas S. Shah",
        "desc": "Black Honda Activa 6G",
        "reason": "Chain Snatching Incident Suspect Sighting",
        "category": "eGujCop CCTNS Platform",
        "priority": "MEDIUM",
        "source": "eGujCop",
        "fir": "FIR-2024-GND-102"
    },
    {
        "plate": "GJ06GH3456",
        "owner": "Harshvardhan R. Solanki",
        "desc": "Silver Hyundai Creta",
        "reason": "Wanted Accused under Non-Bailable Warrant",
        "category": "Judicial Warrant (AFIS Match)",
        "priority": "CRITICAL",
        "source": "AFIS / NAFIS Fingerprint Linked",
        "fir": "NBW-VAD-2024-319"
    }
]

def seed_database():
    db = SessionLocal()
    print("[DATABASE SEEDER] Initializing Gujarat State CCTV Registry data...")

    # 1. Seed Departments
    dept_obj_map = {}
    for d_data in GUJARAT_DEPARTMENTS:
        existing = db.query(Department).filter(Department.code == d_data["code"]).first()
        if not existing:
            dept = Department(
                name=d_data["name"],
                code=d_data["code"],
                category=d_data["category"],
                color=d_data["color"],
                icon=d_data["icon"],
                description=d_data["desc"]
            )
            db.add(dept)
            db.commit()
            db.refresh(dept)
            dept_obj_map[d_data["code"]] = dept
        else:
            dept_obj_map[d_data["code"]] = existing

    print(f"[OK] Verified {len(dept_obj_map)} Government Departments.")

    # 2. Seed VMS Systems
    vms_obj_map = {}
    for v_data in SAMPLE_VMS_SYSTEMS:
        existing = db.query(VMSSystem).filter(VMSSystem.code == v_data["code"]).first()
        dept = dept_obj_map.get(v_data["dept_code"])
        if not existing and dept:
            vms = VMSSystem(
                name=v_data["name"],
                code=v_data["code"],
                department_id=dept.id,
                vendor=v_data["vendor"],
                host=v_data["host"],
                port=v_data["port"],
                protocol=v_data["protocol"],
                connection_status="ONLINE"
            )
            db.add(vms)
            db.commit()
            db.refresh(vms)
            vms_obj_map[v_data["code"]] = vms
        elif existing:
            vms_obj_map[v_data["code"]] = existing

    print(f"[OK] Verified {len(vms_obj_map)} VMS Systems.")

    # 3. Seed Cameras
    created_cameras = 0
    camera_obj_map = {}
    for c_data in SAMPLE_CAMERAS:
        existing = db.query(Camera).filter(Camera.camera_code == c_data["code"]).first()
        dept = dept_obj_map.get(c_data["dept"])
        vms = vms_obj_map.get(c_data["vms"])
        
        stream_id = c_data["stream_id"]
        # Public demonstration stream URLs (HLS + RTSP fallback)
        hls_url = f"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        whep_url = f"http://localhost:8889/stream/{stream_id}/whep"
        rtsp_url = f"rtsp://localhost:8554/stream/{stream_id}"

        if not existing and dept:
            cam = Camera(
                camera_code=c_data["code"],
                name=c_data["name"],
                department_id=dept.id,
                vms_id=vms.id if vms else None,
                district=c_data["dist"],
                city=c_data["dist"].split()[0],
                latitude=c_data["lat"],
                longitude=c_data["lng"],
                camera_type=c_data["type"],
                ownership="Government",
                status=c_data["status"],
                connectivity_status="Connected" if c_data["status"] == "Active" else "Disconnected",
                storage_type="Local NVR",
                retention_days=15 if c_data["dept"] == "POLICE" else 30,
                grid_stream_id=stream_id,
                hls_url=hls_url,
                whep_url=whep_url,
                rtsp_url=rtsp_url,
                codec="H.264",
                analytics_enabled=True if c_data["type"] == "ANPR" else False,
                anpr_enabled=True if c_data["type"] == "ANPR" else False
            )
            db.add(cam)
            created_cameras += 1
            camera_obj_map[c_data["code"]] = cam

    db.commit()
    print(f"[OK] Seeded/verified {len(SAMPLE_CAMERAS)} Strategic CCTV assets across Gujarat.")

    # 4. Seed Users with RBAC
    default_users = [
        {"username": "admin", "email": "admin@gujarat.police.gov.in", "name": "State Super Administrator", "role": UserRole.SUPER_ADMIN, "dept": None},
        {"username": "police_admin", "email": "police.admin@gujarat.police.gov.in", "name": "DSP Traffic & Law Command", "role": UserRole.DEPARTMENT_ADMIN, "dept": "POLICE"},
        {"username": "rto_admin", "email": "rto.admin@gujarat.transport.gov.in", "name": "RTO Commissionerate Admin", "role": UserRole.DEPARTMENT_ADMIN, "dept": "RTO"},
        {"username": "operator", "email": "operator@cctv.command.gujarat.gov.in", "name": "Command Center Duty Officer", "role": UserRole.OPERATOR, "dept": "AMC"},
        {"username": "viewer", "email": "viewer@auditor.gujarat.gov.in", "name": "Departmental Read-Only Auditor", "role": UserRole.VIEWER, "dept": None}
    ]

    for u_data in default_users:
        existing = db.query(User).filter(User.username == u_data["username"]).first()
        dept = dept_obj_map.get(u_data["dept"]) if u_data["dept"] else None
        if not existing:
            user = User(
                username=u_data["username"],
                email=u_data["email"],
                full_name=u_data["name"],
                hashed_password=get_password_hash("password123"),
                role=u_data["role"],
                department_id=dept.id if dept else None,
                is_active=True
            )
            db.add(user)
    db.commit()
    print("[OK] Seeded default RBAC users (admin, police_admin, rto_admin, operator, viewer with password 'password123').")

    # 5. Seed Watchlist
    for w_data in SAMPLE_WATCHLIST:
        existing = db.query(Watchlist).filter(Watchlist.plate_number == w_data["plate"]).first()
        if not existing:
            wl = Watchlist(
                plate_number=w_data["plate"],
                vehicle_owner=w_data["owner"],
                vehicle_description=w_data["desc"],
                reason=w_data["reason"],
                category=w_data["category"],
                priority=w_data["priority"],
                source_database=w_data["source"],
                fir_number=w_data["fir"],
                is_active=True
            )
            db.add(wl)
    db.commit()
    print("[OK] Seeded eGujCop & VAHAN vehicle watchlist items.")

    # 6. Seed Sample Historical ANPR Detections & Trajectory
    first_cam = db.query(Camera).filter(Camera.camera_code == "CAM-AHM-POL-001").first()
    second_cam = db.query(Camera).filter(Camera.camera_code == "CAM-GND-POL-005").first()
    third_cam = db.query(Camera).filter(Camera.camera_code == "CAM-DAH-RTO-015").first()

    if first_cam and second_cam and third_cam:
        existing_anpr = db.query(ANPRResult).filter(ANPRResult.plate_number == "GJ01AB1234").first()
        if not existing_anpr:
            now = datetime.utcnow()
            d1 = ANPRResult(
                camera_id=first_cam.id,
                plate_number="GJ01AB1234",
                confidence=0.96,
                vehicle_type="Four-Wheeler / Car",
                vehicle_color="White",
                speed_kmph=52.4,
                detected_at=now - timedelta(hours=3, minutes=15)
            )
            d2 = ANPRResult(
                camera_id=second_cam.id,
                plate_number="GJ01AB1234",
                confidence=0.93,
                vehicle_type="Four-Wheeler / Car",
                vehicle_color="White",
                speed_kmph=68.0,
                detected_at=now - timedelta(hours=2, minutes=5)
            )
            d3 = ANPRResult(
                camera_id=third_cam.id,
                plate_number="GJ01AB1234",
                confidence=0.95,
                vehicle_type="Four-Wheeler / Car",
                vehicle_color="White",
                speed_kmph=74.2,
                detected_at=now - timedelta(minutes=42)
            )
            db.add_all([d1, d2, d3])
            db.commit()

            # Seed an active alert for the latest sighting
            alert = Alert(
                camera_id=third_cam.id,
                alert_type="WATCHLIST_MATCH",
                severity="HIGH",
                title="[ALERT] Watchlist Intercept: Stolen Vehicle GJ01AB1234",
                message="Vehicle GJ01AB1234 (White Swift) flagged under eGujCop FIR #2024/491 detected at Dahod Jhalod MP Border Checkpost.",
                matched_plate="GJ01AB1234",
                status="NEW",
                is_acknowledged=False
            )
            db.add(alert)
            db.commit()
            print("[OK] Seeded sample ANPR vehicle trajectory & real-time alert.")

    db.close()
    print("[SUCCESS] Gujarat CCTV Platform database seed complete.")

if __name__ == "__main__":
    seed_database()
