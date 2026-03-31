from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.models.models import Base
from app.routers import auth, chat, hospitals, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FindMEDKH API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(hospitals.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "FindMEDKH API running 🏥"}
