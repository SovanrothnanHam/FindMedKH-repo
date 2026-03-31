from sqlalchemy import Column, Integer, String, Text, Enum, DECIMAL, TIMESTAMP, ForeignKey, Table, func
from sqlalchemy.orm import relationship
from app.core.database import Base

# Many-to-many join table
hospital_specialties = Table(
    "hospital_specialties", Base.metadata,
    Column("hospital_id", Integer, ForeignKey("hospitals.hospital_id", ondelete="CASCADE"), primary_key=True),
    Column("specialty_id", Integer, ForeignKey("specialties.specialty_id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    user_id       = Column(Integer, primary_key=True, autoincrement=True)
    full_name     = Column(String(100))
    email         = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role          = Column(Enum("user", "admin"), default="user")
    created_at    = Column(TIMESTAMP, server_default=func.now())
    sessions      = relationship("ChatSession", back_populates="user")

class Hospital(Base):
    __tablename__ = "hospitals"
    hospital_id   = Column(Integer, primary_key=True, autoincrement=True)
    name          = Column(String(150), nullable=False)
    hospital_type = Column(Enum("public", "private"), nullable=False)
    description   = Column(Text)
    address       = Column(String(255))
    city          = Column(String(100), default="Phnom Penh")
    latitude      = Column(DECIMAL(10, 7))
    longitude     = Column(DECIMAL(10, 7))
    phone         = Column(String(50))
    email         = Column(String(100))
    website       = Column(String(150))
    opening_hours = Column(String(100))
    created_at    = Column(TIMESTAMP, server_default=func.now())
    specialties   = relationship("Specialty", secondary=hospital_specialties, back_populates="hospitals")

class Specialty(Base):
    __tablename__ = "specialties"
    specialty_id   = Column(Integer, primary_key=True, autoincrement=True)
    specialty_name = Column(String(100), unique=True, nullable=False)
    description    = Column(Text)
    keywords       = Column(Text)
    hospitals      = relationship("Hospital", secondary=hospital_specialties, back_populates="specialties")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    session_id    = Column(String(100), primary_key=True)
    user_id       = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    message_count = Column(Integer, default=0)
    created_at    = Column(TIMESTAMP, server_default=func.now())
    user          = relationship("User", back_populates="sessions")
    messages      = relationship("ChatMessage", back_populates="session", cascade="all, delete")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    message_id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), ForeignKey("chat_sessions.session_id", ondelete="CASCADE"))
    sender     = Column(Enum("user", "bot"))
    message    = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    session    = relationship("ChatSession", back_populates="messages")

class ChatbotIntent(Base):
    __tablename__ = "chatbot_intents"
    intent_id         = Column(Integer, primary_key=True, autoincrement=True)
    intent_name       = Column(String(100), unique=True)
    example_questions = Column(Text)
    response_template = Column(Text)
