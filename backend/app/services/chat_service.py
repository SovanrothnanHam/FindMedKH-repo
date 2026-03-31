from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import ChatSession, ChatMessage
from app.core.config import settings

def get_or_create_session(db: Session, session_id: str, user_id: Optional[int] = None) -> ChatSession:
    s = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not s:
        s = ChatSession(session_id=session_id, user_id=user_id, message_count=0)
        db.add(s); db.commit(); db.refresh(s)
    elif user_id and s.user_id is None:
        s.user_id = user_id; db.commit()
    return s

def check_guest_limit(session: ChatSession) -> bool:
    if session.user_id is not None:
        return False
    return session.message_count >= settings.GUEST_MAX_MESSAGES

def increment(db: Session, session: ChatSession):
    session.message_count += 1; db.commit()

def save_message(db: Session, session_id: str, sender: str, message: str) -> ChatMessage:
    m = ChatMessage(session_id=session_id, sender=sender, message=message)
    db.add(m); db.commit(); db.refresh(m)
    return m

def get_history(db: Session, session_id: str) -> list[ChatMessage]:
    return db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
