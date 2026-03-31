from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.models import Hospital, Specialty, User
from app.schemas.schemas import HospitalCreate, HospitalUpdate, HospitalOut, SpecialtyCreate, SpecialtyOut, SuccessResponse, UserOut
from app.services import hospital_service
from app.services.intent_service import reload

router = APIRouter(prefix="/admin", tags=["Admin"])

def _orm_to_out(h):
    return HospitalOut(
        hospital_id=h.hospital_id, name=h.name, hospital_type=h.hospital_type,
        description=h.description, address=h.address, city=h.city,
        latitude=float(h.latitude) if h.latitude else None,
        longitude=float(h.longitude) if h.longitude else None,
        phone=h.phone, email=h.email, website=h.website,
        opening_hours=h.opening_hours,
        specialties=[s.specialty_name for s in h.specialties],
    )

# ── Dashboard stats ───────────────────────────────────────────────────────────
@router.get("/stats")
def stats(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    from app.models.models import ChatMessage, ChatSession
    total_h   = db.query(Hospital).count()
    public_h  = db.query(Hospital).filter(Hospital.hospital_type=="public").count()
    private_h = db.query(Hospital).filter(Hospital.hospital_type=="private").count()
    total_u   = db.query(User).count()
    total_msg = db.query(ChatMessage).count()
    total_s   = db.query(Specialty).count()
    return {"total_hospitals": total_h, "public": public_h, "private": private_h,
            "total_users": total_u, "total_messages": total_msg, "total_specialties": total_s}

# ── Hospitals CRUD ────────────────────────────────────────────────────────────
@router.get("/hospitals", response_model=list[HospitalOut])
def list_hospitals(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    return hospital_service.get_all_hospitals(db)

@router.get("/hospitals/{hospital_id}", response_model=HospitalOut)
def get_hospital(hospital_id: int, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    h = hospital_service.get_hospital_by_id(db, hospital_id)
    if not h: raise HTTPException(404, "Not found")
    return _orm_to_out(h)

@router.post("/hospitals", response_model=HospitalOut, status_code=201)
def create_hospital(payload: HospitalCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    h = hospital_service.create_hospital(db, payload.model_dump(exclude={"specialty_ids"}), payload.specialty_ids)
    return _orm_to_out(h)

@router.put("/hospitals/{hospital_id}", response_model=HospitalOut)
def update_hospital(hospital_id: int, payload: HospitalUpdate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    h = hospital_service.get_hospital_by_id(db, hospital_id)
    if not h: raise HTTPException(404, "Not found")
    h = hospital_service.update_hospital(db, h, payload.model_dump(exclude={"specialty_ids"}, exclude_none=True), payload.specialty_ids)
    return _orm_to_out(h)

@router.delete("/hospitals/{hospital_id}", response_model=SuccessResponse)
def delete_hospital(hospital_id: int, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    h = hospital_service.get_hospital_by_id(db, hospital_id)
    if not h: raise HTTPException(404, "Not found")
    hospital_service.delete_hospital(db, h)
    return SuccessResponse(message=f"Hospital {hospital_id} deleted")

# ── Specialties CRUD ──────────────────────────────────────────────────────────
@router.get("/specialties", response_model=list[SpecialtyOut])
def list_specialties(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    return db.query(Specialty).order_by(Specialty.specialty_name).all()

@router.post("/specialties", response_model=SpecialtyOut, status_code=201)
def create_specialty(payload: SpecialtyCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    if db.query(Specialty).filter(Specialty.specialty_name == payload.specialty_name).first():
        raise HTTPException(400, "Specialty already exists")
    s = Specialty(**payload.model_dump())
    db.add(s); db.commit(); db.refresh(s)
    reload(db)
    return s

@router.put("/specialties/{sid}", response_model=SpecialtyOut)
def update_specialty(sid: int, payload: SpecialtyCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    s = db.query(Specialty).filter(Specialty.specialty_id == sid).first()
    if not s: raise HTTPException(404, "Not found")
    for k, v in payload.model_dump().items(): setattr(s, k, v)
    db.commit(); db.refresh(s); reload(db)
    return s

@router.delete("/specialties/{sid}", response_model=SuccessResponse)
def delete_specialty(sid: int, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    s = db.query(Specialty).filter(Specialty.specialty_id == sid).first()
    if not s: raise HTTPException(404, "Not found")
    db.delete(s); db.commit(); reload(db)
    return SuccessResponse(message=f"Specialty {sid} deleted")

# ── Users ─────────────────────────────────────────────────────────────────────
@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(get_current_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.delete("/users/{uid}", response_model=SuccessResponse)
def delete_user(uid: int, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    u = db.query(User).filter(User.user_id == uid).first()
    if not u: raise HTTPException(404, "Not found")
    db.delete(u); db.commit()
    return SuccessResponse(message=f"User {uid} deleted")
