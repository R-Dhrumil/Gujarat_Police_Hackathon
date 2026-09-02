from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.departments import router as departments_router
from app.api.v1.cameras import router as cameras_router
from app.api.v1.vms import router as vms_router
from app.api.v1.streams import router as streams_router
from app.api.v1.grid import router as grid_router
from app.api.v1.anpr import router as anpr_router
from app.api.v1.watchlist import router as watchlist_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.events import router as events_router
from app.api.v1.reports import router as reports_router
from app.api.v1.audit import router as audit_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(departments_router)
api_router.include_router(cameras_router)
api_router.include_router(vms_router)
api_router.include_router(streams_router)
api_router.include_router(grid_router)
api_router.include_router(anpr_router)
api_router.include_router(watchlist_router)
api_router.include_router(alerts_router)
api_router.include_router(events_router)
api_router.include_router(reports_router)
api_router.include_router(audit_router)
