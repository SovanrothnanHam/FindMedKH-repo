from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import ChatRequest, ChatResponse, ChatHistoryResponse, MessageHistoryItem
from app.services import intent_service, hospital_service, chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    session = chat_service.get_or_create_session(db, payload.session_id, payload.user_id)

    if chat_service.check_guest_limit(session):
        return ChatResponse(
            session_id=payload.session_id, intent="limit_reached",
            response_text="⚠️ You've reached the 5-message guest limit. Please log in to continue.",
            hospitals=[], message_count=session.message_count, limit_reached=True,
        )

    intent_name, template = intent_service.detect_intent(payload.message, db)
    specialty_names = intent_service.map_intent_to_specialties(intent_name)

    hospitals = []
    if specialty_names:
        hospitals = hospital_service.get_hospitals_by_specialties(
            db, specialty_names, payload.latitude, payload.longitude, top_n=3)

    response_text = template if (hospitals or intent_name in ("greeting","thanks","goodbye")) else \
        f"{template} I couldn't find specific hospitals right now — please try rephrasing."

    chat_service.save_message(db, payload.session_id, "user", payload.message)
    chat_service.save_message(db, payload.session_id, "bot", response_text)
    chat_service.increment(db, session)

    return ChatResponse(session_id=payload.session_id, intent=intent_name,
        response_text=response_text, hospitals=hospitals,
        message_count=session.message_count, limit_reached=False)

@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
def history(session_id: str, db: Session = Depends(get_db)):
    msgs = chat_service.get_history(db, session_id)
    return ChatHistoryResponse(session_id=session_id, messages=[
        MessageHistoryItem(sender=m.sender, message=m.message, created_at=m.created_at)
        for m in msgs])
