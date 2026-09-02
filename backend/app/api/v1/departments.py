from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.department import Department
from app.models.camera import Camera
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentOut
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("", response_model=List[DepartmentOut])
def get_departments(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Department)
    if category:
        query = query.filter(Department.category == category)
    
    departments = query.offset(skip).limit(limit).all()
    results = []

    for d in departments:
        d_out = DepartmentOut.from_orm(d)
        d_out.camera_count = db.query(Camera).filter(Camera.department_id == d.id).count()
        d_out.active_camera_count = db.query(Camera).filter(
            Camera.department_id == d.id, Camera.status == "Active"
        ).count()
        results.append(d_out)

    return results

@router.get("/{id}", response_model=DepartmentOut)
def get_department(id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    d_out = DepartmentOut.from_orm(dept)
    d_out.camera_count = db.query(Camera).filter(Camera.department_id == dept.id).count()
    d_out.active_camera_count = db.query(Camera).filter(
        Camera.department_id == dept.id, Camera.status == "Active"
    ).count()
    return d_out

@router.post("", response_model=DepartmentOut)
def create_department(dept_in: DepartmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Department).filter(
        (Department.name == dept_in.name) | (Department.code == dept_in.code)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name or code already exists")
    
    dept = Department(**dept_in.dict())
    db.add(dept)
    db.commit()
    db.refresh(dept)

    log_audit_event(
        db=db,
        action="DEPARTMENT_CREATE",
        resource_type="Department",
        resource_id=str(dept.id),
        details=f"Created department {dept.name} ({dept.code})"
    )

    d_out = DepartmentOut.from_orm(dept)
    d_out.camera_count = 0
    d_out.active_camera_count = 0
    return d_out

@router.put("/{id}", response_model=DepartmentOut)
def update_department(id: int, dept_in: DepartmentUpdate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    update_data = dept_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(dept, field, val)

    db.commit()
    db.refresh(dept)

    log_audit_event(
        db=db,
        action="DEPARTMENT_UPDATE",
        resource_type="Department",
        resource_id=str(dept.id),
        details=f"Updated department {dept.name}"
    )

    d_out = DepartmentOut.from_orm(dept)
    d_out.camera_count = db.query(Camera).filter(Camera.department_id == dept.id).count()
    d_out.active_camera_count = db.query(Camera).filter(
        Camera.department_id == dept.id, Camera.status == "Active"
    ).count()
    return d_out

@router.delete("/{id}")
def delete_department(id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    camera_count = db.query(Camera).filter(Camera.department_id == id).count()
    if camera_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete department with {camera_count} associated cameras. Reassign or delete cameras first."
        )

    db.delete(dept)
    db.commit()

    log_audit_event(
        db=db,
        action="DEPARTMENT_DELETE",
        resource_type="Department",
        resource_id=str(id),
        details=f"Deleted department {dept.name}"
    )

    return {"success": True, "message": f"Department '{dept.name}' deleted successfully"}
