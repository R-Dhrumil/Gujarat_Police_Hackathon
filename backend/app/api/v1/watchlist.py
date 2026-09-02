from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.watchlist import Watchlist
from app.models.anpr import ANPRResult
from app.schemas.watchlist import WatchlistCreate, WatchlistUpdate, WatchlistOut
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/watchlist", tags=["Vehicle Watchlist & Law Enforcement Integrations"])

def enrich_watchlist_out(item: Watchlist, db: Session) -> WatchlistOut:
    out = WatchlistOut.from_orm(item)
    out.match_count = db.query(ANPRResult).filter(ANPRResult.plate_number == item.plate_number).count()
    return out

@router.get("", response_model=List[WatchlistOut])
def get_watchlist(
    priority: Optional[str] = None,
    category: Optional[str] = None,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Watchlist)
    if priority:
        query = query.filter(Watchlist.priority == priority)
    if category:
        query = query.filter(Watchlist.category == category)
    if active_only:
        query = query.filter(Watchlist.is_active == True)

    items = query.all()
    return [enrich_watchlist_out(w, db) for w in items]

@router.post("", response_model=WatchlistOut)
def add_to_watchlist(
    item_in: WatchlistCreate,
    db: Session = Depends(get_db)
):
    clean_plate = item_in.plate_number.replace(" ", "").replace("-", "").upper()
    existing = db.query(Watchlist).filter(Watchlist.plate_number == clean_plate).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Plate number {clean_plate} is already on the watchlist (ID #{existing.id})"
        )

    data = item_in.dict()
    data["plate_number"] = clean_plate
    item = Watchlist(**data)
    db.add(item)
    db.commit()
    db.refresh(item)

    log_audit_event(
        db=db,
        action="WATCHLIST_CREATE",
        resource_type="Watchlist",
        resource_id=str(item.id),
        details=f"Added {clean_plate} to watchlist for reason: {item.reason} [{item.priority}]"
    )

    return enrich_watchlist_out(item, db)

@router.put("/{id}", response_model=WatchlistOut)
def update_watchlist_item(
    id: int,
    item_in: WatchlistUpdate,
    db: Session = Depends(get_db)
):
    item = db.query(Watchlist).filter(Watchlist.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")

    update_data = item_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)

    db.commit()
    db.refresh(item)

    log_audit_event(
        db=db,
        action="WATCHLIST_UPDATE",
        resource_type="Watchlist",
        resource_id=str(item.id),
        details=f"Updated watchlist entry for {item.plate_number}"
    )

    return enrich_watchlist_out(item, db)

@router.delete("/{id}")
def delete_watchlist_item(id: int, db: Session = Depends(get_db)):
    item = db.query(Watchlist).filter(Watchlist.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")

    plate = item.plate_number
    db.delete(item)
    db.commit()

    log_audit_event(
        db=db,
        action="WATCHLIST_DELETE",
        resource_type="Watchlist",
        resource_id=str(id),
        details=f"Removed {plate} from watchlist"
    )

    return {"success": True, "message": f"Plate {plate} removed from watchlist"}
