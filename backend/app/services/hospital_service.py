import math
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from app.models.models import Hospital, Specialty, hospital_specialties
from app.schemas.schemas import HospitalOut

def haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    a = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a)), 2)

def _to_out(h: Hospital, dist=None) -> HospitalOut:
    return HospitalOut(
        hospital_id=h.hospital_id, name=h.name, hospital_type=h.hospital_type,
        description=h.description, address=h.address, city=h.city,
        latitude=float(h.latitude) if h.latitude else None,
        longitude=float(h.longitude) if h.longitude else None,
        phone=h.phone, email=h.email, website=h.website,
        opening_hours=h.opening_hours, distance_km=dist,
        specialties=[s.specialty_name for s in h.specialties],
    )

def get_hospitals_by_specialties(db: Session, specialty_names: list[str],
    user_lat=None, user_lon=None, top_n=3) -> list[HospitalOut]:
    q = db.query(Hospital).options(joinedload(Hospital.specialties))
    if specialty_names:
        q = (q.join(hospital_specialties, Hospital.hospital_id == hospital_specialties.c.hospital_id)
               .join(Specialty, Specialty.specialty_id == hospital_specialties.c.specialty_id)
               .filter(Specialty.specialty_name.in_(specialty_names)).distinct())
    hospitals = q.all()
    results = []
    for h in hospitals:
        dist = None
        if user_lat and user_lon and h.latitude and h.longitude:
            dist = haversine(user_lat, user_lon, float(h.latitude), float(h.longitude))
        results.append(_to_out(h, dist))
    if user_lat and user_lon:
        results.sort(key=lambda x: (x.distance_km is None, x.distance_km or 0))
    return results[:top_n]

def get_all_hospitals(db: Session, search: str = "", type_filter: str = "",
    specialty_filter: str = "") -> list[HospitalOut]:
    q = db.query(Hospital).options(joinedload(Hospital.specialties))
    if search:
        q = q.filter(Hospital.name.ilike(f"%{search}%"))
    if type_filter:
        q = q.filter(Hospital.hospital_type == type_filter)
    if specialty_filter:
        q = (q.join(hospital_specialties, Hospital.hospital_id == hospital_specialties.c.hospital_id)
               .join(Specialty, Specialty.specialty_id == hospital_specialties.c.specialty_id)
               .filter(Specialty.specialty_name == specialty_filter).distinct())
    return [_to_out(h) for h in q.all()]

def get_hospital_by_id(db: Session, hospital_id: int):
    return db.query(Hospital).options(joinedload(Hospital.specialties)).filter(Hospital.hospital_id == hospital_id).first()

def create_hospital(db: Session, data: dict, specialty_ids: list[int]) -> Hospital:
    h = Hospital(**data)
    if specialty_ids:
        h.specialties = db.query(Specialty).filter(Specialty.specialty_id.in_(specialty_ids)).all()
    db.add(h); db.commit(); db.refresh(h)
    return h

def update_hospital(db: Session, h: Hospital, data: dict, specialty_ids) -> Hospital:
    for k, v in data.items(): setattr(h, k, v)
    if specialty_ids is not None:
        h.specialties = db.query(Specialty).filter(Specialty.specialty_id.in_(specialty_ids)).all()
    db.commit(); db.refresh(h)
    return h

def delete_hospital(db: Session, h: Hospital):
    db.delete(h); db.commit()

def get_stats(db: Session) -> dict:
    total = db.query(Hospital).count()
    public = db.query(Hospital).filter(Hospital.hospital_type == "public").count()
    private = db.query(Hospital).filter(Hospital.hospital_type == "private").count()
    specialties = db.query(Specialty).count()
    users = db.query(__import__('app.models.models', fromlist=['User']).User).count()
    return {"total_hospitals": total, "public": public, "private": private,
            "specialties": specialties, "users": users}
