import re
from sqlalchemy.orm import Session
from app.models.models import ChatbotIntent

_intent_cache: list[dict] = []

def _load(db: Session):
    global _intent_cache
    rows = db.query(ChatbotIntent).all()
    _intent_cache = [
        {
            "intent_name": r.intent_name,
            "keywords": [w.strip().lower() for w in (r.example_questions or "").split(",") if w.strip()],
            "response_template": r.response_template or "",
        }
        for r in rows
    ]

def _tokenise(text: str) -> list[str]:
    text = re.sub(r"[^\w\s]", " ", text.lower())
    words = text.split()
    return words + [f"{words[i]} {words[i+1]}" for i in range(len(words) - 1)]

def detect_intent(message: str, db: Session) -> tuple[str, str]:
    if not _intent_cache:
        _load(db)
    tokens = _tokenise(message)
    scores: dict[str, int] = {}
    for intent in _intent_cache:
        hit = sum(1 for kw in intent["keywords"] if any(kw in t or t in kw for t in tokens))
        if hit > 0:
            scores[intent["intent_name"]] = hit
    if not scores:
        return "general_medicine", _get_tpl("general_medicine")
    best = max(scores, key=lambda k: scores[k])
    return best, _get_tpl(best)

def map_intent_to_specialties(intent: str) -> list[str]:
    MAP = {
        "greeting": [], "thanks": [], "goodbye": [],
        "find_hospital": [], "location_query": [],
        "emergency":        ["Emergency Medicine"],
        "cardiology":       ["Cardiology"],
        "pediatrics":       ["Pediatrics", "Neonatology"],
        "maternity":        ["Obstetrics & Gynecology", "Maternity Care"],
        "dentistry":        ["Dentistry", "Dental Surgery"],
        "ophthalmology":    ["Ophthalmology", "Eye Surgery"],
        "mental_health":    ["Mental Health", "Psychology", "Psychiatry"],
        "physiotherapy":    ["Physiotherapy", "Rehabilitation", "Fitness & Rehabilitation"],
        "surgery":          ["Surgery"],
        "general_medicine": ["General Medicine"],
    }
    return MAP.get(intent, ["General Medicine"])

def _get_tpl(intent: str) -> str:
    for i in _intent_cache:
        if i["intent_name"] == intent:
            return i["response_template"]
    return "Here are some hospitals that may help:"

def reload(db: Session):
    global _intent_cache
    _intent_cache = []
    _load(db)
