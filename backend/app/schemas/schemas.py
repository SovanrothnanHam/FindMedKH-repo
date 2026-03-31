from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

# ── Auth ──────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    full_name: str
    role: str

# ── Hospital ──────────────────────────────────────────────────────────────────
class HospitalBase(BaseModel):
    name: str
    hospital_type: str
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = "Phnom Penh"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[str] = None

class HospitalCreate(HospitalBase):
    specialty_ids: List[int] = []

class HospitalUpdate(HospitalBase):
    specialty_ids: Optional[List[int]] = None

class HospitalOut(HospitalBase):
    hospital_id: int
    distance_km: Optional[float] = None
    specialties: List[str] = []
    model_config = {"from_attributes": True}

# ── Specialty ─────────────────────────────────────────────────────────────────
class SpecialtyBase(BaseModel):
    specialty_name: str
    description: Optional[str] = None
    keywords: Optional[str] = None

class SpecialtyCreate(SpecialtyBase):
    pass

class SpecialtyOut(SpecialtyBase):
    specialty_id: int
    model_config = {"from_attributes": True}

# ── Chat ──────────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    session_id: str
    message: str
    user_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ChatResponse(BaseModel):
    session_id: str
    intent: str
    response_text: str
    hospitals: List[HospitalOut] = []
    message_count: int
    limit_reached: bool = False

class MessageHistoryItem(BaseModel):
    sender: str
    message: str
    created_at: datetime
    model_config = {"from_attributes": True}

class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[MessageHistoryItem]

# ── Users (admin) ─────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    user_id: int
    full_name: Optional[str]
    email: str
    role: str
    created_at: Optional[datetime]
    model_config = {"from_attributes": True}

class SuccessResponse(BaseModel):
    message: str
