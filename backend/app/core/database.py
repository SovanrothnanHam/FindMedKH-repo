from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings
from urllib.parse import quote_plus

DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{quote_plus(settings.DB_PASSWORD)}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}?charset=utf8mb4"
)

# DATABASE_URL = (
#     f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}"
#     f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}?charset=utf8mb4"
# )

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
