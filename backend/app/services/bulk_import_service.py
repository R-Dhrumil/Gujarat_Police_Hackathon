import io
import re
from typing import List, Dict, Any, Tuple
import pandas as pd
from sqlalchemy.orm import Session
from app.models.department import Department
from app.models.camera import Camera
from app.schemas.bulk_import import BulkImportPreview, RowValidationResult, BulkImportResult

VALID_CAMERA_TYPES = {"IP", "ANALOG", "PTZ", "DOME", "BULLET", "ANPR", "THERMAL", "360-PANORAMIC"}
VALID_STATUSES = {"ACTIVE", "INACTIVE", "MAINTENANCE", "DECOMMISSIONED"}
VALID_OWNERSHIPS = {"GOVERNMENT", "PUBLIC-PRIVATE", "SOCIETY", "COMMERCIAL MALL", "PRIVATE"}

def parse_file_to_dataframe(file_contents: bytes, filename: str) -> pd.DataFrame:
    """Parse CSV or Excel into a pandas dataframe with standardized columns"""
    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_contents))
    elif filename.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(file_contents))
    else:
        raise ValueError("Unsupported file format. Please upload CSV or Excel (.xlsx/.xls).")
    
    # Standardize column headers (lowercase, strip whitespace, replace spaces with underscores)
    df.columns = [re.sub(r'[^a-z0-9_]', '', col.strip().lower().replace(" ", "_")) for col in df.columns]
    return df

def validate_bulk_camera_rows(df: pd.DataFrame, db: Session) -> BulkImportPreview:
    """
    Validates each row of the uploaded camera dataset.
    Returns preview containing valid rows, invalid rows with specific error messages,
    and detected departments.
    """
    existing_departments = {d.name.lower(): d for d in db.query(Department).all()}
    existing_departments.update({d.code.lower(): d for d in db.query(Department).all()})
    existing_camera_codes = {c.camera_code for c in db.query(Camera.camera_code).all()}

    valid_rows: List[RowValidationResult] = []
    invalid_rows: List[RowValidationResult] = []
    detected_departments_set = set()
    new_departments_to_create = set()

    for idx, row in df.iterrows():
        row_num = idx + 2 # Excel 1-based index (header is row 1)
        row_dict = row.to_dict()
        # Clean nan values
        row_dict = {k: (None if pd.isna(v) else v) for k, v in row_dict.items()}
        
        errors = []
        warnings = []

        # 1. Camera Code
        cam_code = str(row_dict.get("camera_code") or row_dict.get("camera_id") or row_dict.get("code") or "").strip()
        if not cam_code:
            errors.append("Missing Camera Code / Camera ID.")
        elif cam_code in existing_camera_codes:
            warnings.append(f"Camera code '{cam_code}' already exists (will update on confirm).")
        row_dict["camera_code"] = cam_code

        # 2. Camera Name
        cam_name = str(row_dict.get("name") or row_dict.get("camera_name") or cam_code or "Unnamed Camera").strip()
        row_dict["name"] = cam_name

        # 3. Department
        dept_str = str(row_dict.get("department") or row_dict.get("department_name") or row_dict.get("dept") or "").strip()
        if not dept_str:
            errors.append("Missing Department.")
        else:
            detected_departments_set.add(dept_str)
            if dept_str.lower() not in existing_departments:
                new_departments_to_create.add(dept_str)
        row_dict["department_str"] = dept_str

        # 4. Latitude validation (-90 to +90, Gujarat is roughly 20.0 to 24.8)
        try:
            lat = float(row_dict.get("latitude") or row_dict.get("lat") or 0.0)
            if not (-90.0 <= lat <= 90.0) or lat == 0.0:
                errors.append(f"Invalid Latitude: {lat}. Must be between -90 and 90.")
            elif not (19.0 <= lat <= 25.0):
                warnings.append(f"Latitude {lat} is outside expected Gujarat boundary (20.0 - 24.8).")
            row_dict["latitude"] = lat
        except (ValueError, TypeError):
            errors.append(f"Latitude '{row_dict.get('latitude')}' is not a valid number.")
            row_dict["latitude"] = 0.0

        # 5. Longitude validation (-180 to +180, Gujarat is roughly 68.0 to 74.5)
        try:
            lng = float(row_dict.get("longitude") or row_dict.get("lng") or row_dict.get("lon") or 0.0)
            if not (-180.0 <= lng <= 180.0) or lng == 0.0:
                errors.append(f"Invalid Longitude: {lng}. Must be between -180 and 180.")
            elif not (68.0 <= lng <= 75.0):
                warnings.append(f"Longitude {lng} is outside expected Gujarat boundary (68.0 - 74.5).")
            row_dict["longitude"] = lng
        except (ValueError, TypeError):
            errors.append(f"Longitude '{row_dict.get('longitude')}' is not a valid number.")
            row_dict["longitude"] = 0.0

        # 6. Camera Type
        cam_type = str(row_dict.get("camera_type") or row_dict.get("type") or "IP").strip().upper()
        if cam_type not in VALID_CAMERA_TYPES:
            warnings.append(f"Unrecognized camera type '{cam_type}'. Defaulting to 'IP'.")
            cam_type = "IP"
        row_dict["camera_type"] = cam_type

        # 7. Status
        status_val = str(row_dict.get("status") or "Active").strip().capitalize()
        if status_val.upper() not in VALID_STATUSES:
            warnings.append(f"Unknown status '{status_val}'. Defaulting to 'Active'.")
            status_val = "Active"
        row_dict["status"] = status_val

        # 8. District & City
        row_dict["district"] = str(row_dict.get("district") or row_dict.get("city") or "Ahmedabad").strip()
        row_dict["city"] = str(row_dict.get("city") or row_dict.get("district") or "Ahmedabad").strip()
        row_dict["landmark_address"] = str(row_dict.get("landmark_address") or row_dict.get("location") or row_dict.get("address") or "").strip()
        row_dict["storage_type"] = str(row_dict.get("storage_type") or row_dict.get("storage") or "Local NVR").strip()
        
        try:
            row_dict["retention_days"] = int(row_dict.get("retention_days") or row_dict.get("retention") or 15)
        except (ValueError, TypeError):
            row_dict["retention_days"] = 15

        res = RowValidationResult(
            row_number=row_num,
            is_valid=(len(errors) == 0),
            data=row_dict,
            errors=errors,
            warnings=warnings
        )

        if res.is_valid:
            valid_rows.append(res)
        else:
            invalid_rows.append(res)

    return BulkImportPreview(
        total_rows=len(df),
        valid_rows_count=len(valid_rows),
        invalid_rows_count=len(invalid_rows),
        valid_rows=valid_rows,
        invalid_rows=invalid_rows,
        detected_departments=sorted(list(detected_departments_set)),
        new_departments_to_create=sorted(list(new_departments_to_create))
    )

def commit_bulk_import_rows(
    rows: List[Dict[str, Any]],
    auto_create_departments: bool,
    default_department_id: int,
    db: Session
) -> BulkImportResult:
    """Inserts or updates verified rows into the database."""
    inserted = 0
    updated = 0
    failed = 0
    errors = []

    # Cache departments
    dept_map = {d.name.lower(): d.id for d in db.query(Department).all()}
    dept_map.update({d.code.lower(): d.id for d in db.query(Department).all()})

    for r in rows:
        try:
            cam_code = r.get("camera_code")
            if not cam_code:
                failed += 1
                continue

            # Determine department
            dept_str = str(r.get("department_str") or r.get("department") or "").strip()
            dept_id = dept_map.get(dept_str.lower())

            if not dept_id:
                if auto_create_departments and dept_str:
                    code_clean = re.sub(r'[^A-Z0-9]', '', dept_str.upper())[:10]
                    new_dept = Department(
                        name=dept_str,
                        code=code_clean or f"DEPT_{len(dept_map)+1}",
                        category="Government",
                        description=f"Auto-created during bulk import for {dept_str}"
                    )
                    db.add(new_dept)
                    db.commit()
                    db.refresh(new_dept)
                    dept_id = new_dept.id
                    dept_map[dept_str.lower()] = dept_id
                else:
                    dept_id = default_department_id

            if not dept_id:
                # Fallback to first department
                first_dept = db.query(Department).first()
                if first_dept:
                    dept_id = first_dept.id
                else:
                    failed += 1
                    errors.append(f"No department found for camera {cam_code}")
                    continue

            # Check if camera exists
            existing_cam = db.query(Camera).filter(Camera.camera_code == cam_code).first()
            
            if existing_cam:
                # Update existing
                existing_cam.name = r.get("name") or existing_cam.name
                existing_cam.department_id = dept_id
                existing_cam.district = r.get("district") or existing_cam.district
                existing_cam.city = r.get("city") or existing_cam.city
                existing_cam.landmark_address = r.get("landmark_address") or existing_cam.landmark_address
                existing_cam.latitude = float(r.get("latitude") or existing_cam.latitude)
                existing_cam.longitude = float(r.get("longitude") or existing_cam.longitude)
                existing_cam.camera_type = r.get("camera_type") or existing_cam.camera_type
                existing_cam.status = r.get("status") or existing_cam.status
                existing_cam.storage_type = r.get("storage_type") or existing_cam.storage_type
                existing_cam.retention_days = int(r.get("retention_days") or existing_cam.retention_days)
                updated += 1
            else:
                # Insert new
                new_cam = Camera(
                    camera_code=cam_code,
                    name=r.get("name") or cam_code,
                    department_id=dept_id,
                    district=r.get("district") or "Ahmedabad",
                    city=r.get("city") or "Ahmedabad",
                    landmark_address=r.get("landmark_address"),
                    latitude=float(r.get("latitude")),
                    longitude=float(r.get("longitude")),
                    camera_type=r.get("camera_type", "IP"),
                    ownership=r.get("ownership", "Government"),
                    status=r.get("status", "Active"),
                    connectivity_status="Connected" if r.get("status") == "Active" else "Disconnected",
                    storage_type=r.get("storage_type", "Local NVR"),
                    retention_days=int(r.get("retention_days", 15)),
                    rtsp_url=r.get("rtsp_url"),
                    hls_url=r.get("hls_url"),
                    whep_url=r.get("whep_url")
                )
                db.add(new_cam)
                inserted += 1

        except Exception as e:
            failed += 1
            errors.append(f"Error processing row {r.get('camera_code')}: {str(e)}")

    db.commit()

    return BulkImportResult(
        success=True,
        inserted_count=inserted,
        updated_count=updated,
        failed_count=failed,
        errors=errors
    )
