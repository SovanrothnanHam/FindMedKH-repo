from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.models import User
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(full_name=payload.full_name, email=payload.email,
                password_hash=hash_password(payload.password), role="user")
    db.add(user); db.commit(); db.refresh(user)
    return {"message": "Account created successfully", "user_id": user.user_id}

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    token = create_access_token({"sub": str(user.user_id)})
    return TokenResponse(access_token=token, user_id=user.user_id,
                         full_name=user.full_name, role=user.role)

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"user_id": current_user.user_id, "full_name": current_user.full_name,
            "email": current_user.email, "role": current_user.role}
