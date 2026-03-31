from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import HospitalOut, SpecialtyOut
from app.services import hospital_service
from app.models.models import Specialty

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.get("", response_model=list[HospitalOut])
def list_hospitals(
    search: str = Query(""), type: str = Query(""),
    specialty: str = Query(""), db: Session = Depends(get_db)
):
    return hospital_service.get_all_hospitals(db, search, type, specialty)

@router.get("/specialties", response_model=list[SpecialtyOut])
def list_specialties(db: Session = Depends(get_db)):
    return db.query(Specialty).order_by(Specialty.specialty_name).all()

@router.get("/{hospital_id}", response_model=HospitalOut)
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    h = hospital_service.get_hospital_by_id(db, hospital_id)
    if not h:
        raise HTTPException(404, "Hospital not found")
    from app.services.hospital_service import _to_out
    return _to_out(h)
