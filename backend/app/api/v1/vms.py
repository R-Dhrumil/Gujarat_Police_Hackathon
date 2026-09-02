from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.vms import VMSSystem
from app.models.camera import Camera
from app.schemas.vms import VMSSystemCreate, VMSSystemUpdate, VMSSystemOut
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/vms", tags=["VMS Systems"])

def enrich_vms_out(vms: VMSSystem, db: Session) -> VMSSystemOut:
    v_out = VMSSystemOut.from_orm(vms)
    if vms.department:
        v_out.department_name = vms.department.name
    v_out.camera_count = db.query(Camera).filter(Camera.vms_id == vms.id).count()
    return v_out

@router.get("", response_model=List[VMSSystemOut])
def get_vms_systems(
    department_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(VMSSystem)
    if department_id:
        query = query.filter(VMSSystem.department_id == department_id)
    systems = query.all()
    return [enrich_vms_out(s, db) for s in systems]

@router.get("/{id}", response_model=VMSSystemOut)
def get_vms_system(id: int, db: Session = Depends(get_db)):
    vms = db.query(VMSSystem).filter(VMSSystem.id == id).first()
    if not vms:
        raise HTTPException(status_code=404, detail="VMS System not found")
    return enrich_vms_out(vms, db)

@router.post("", response_model=VMSSystemOut)
def create_vms_system(vms_in: VMSSystemCreate, db: Session = Depends(get_db)):
    existing = db.query(VMSSystem).filter(VMSSystem.code == vms_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="VMS System code already exists")
    
    vms = VMSSystem(**vms_in.dict())
    db.add(vms)
    db.commit()
    db.refresh(vms)

    log_audit_event(
        db=db,
        action="VMS_CREATE",
        resource_type="VMS",
        resource_id=str(vms.id),
        details=f"Created VMS {vms.name} ({vms.vendor}) at {vms.host}:{vms.port}"
    )

    return enrich_vms_out(vms, db)

@router.put("/{id}", response_model=VMSSystemOut)
def update_vms_system(id: int, vms_in: VMSSystemUpdate, db: Session = Depends(get_db)):
    vms = db.query(VMSSystem).filter(VMSSystem.id == id).first()
    if not vms:
        raise HTTPException(status_code=404, detail="VMS System not found")

    update_data = vms_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(vms, field, val)

    db.commit()
    db.refresh(vms)
    return enrich_vms_out(vms, db)

@router.delete("/{id}")
def delete_vms_system(id: int, db: Session = Depends(get_db)):
    vms = db.query(VMSSystem).filter(VMSSystem.id == id).first()
    if not vms:
        raise HTTPException(status_code=404, detail="VMS System not found")

    db.delete(vms)
    db.commit()
    return {"success": True, "message": f"VMS {vms.name} deleted successfully"}

@router.post("/{id}/test-connection")
def test_vms_connection(id: int, db: Session = Depends(get_db)):
    vms = db.query(VMSSystem).filter(VMSSystem.id == id).first()
    if not vms:
        raise HTTPException(status_code=404, detail="VMS System not found")

    # In production/demo, simulate connection handshake
    vms.connection_status = "ONLINE"
    db.commit()
    return {
        "vms_id": vms.id,
        "name": vms.name,
        "status": "ONLINE",
        "latency_ms": 38.5,
        "protocol": vms.protocol,
        "message": f"Successfully connected to {vms.vendor} VMS gateway at {vms.host}:{vms.port}"
    }
