from fastapi import FastAPI, HTTPException

from .models import AskRequest, AskResponse, AuditEvent
from .service import KnowledgeAssistant

app = FastAPI(title="Fictional Permission-Aware Knowledge Assistant", version="0.1.0")
assistant = KnowledgeAssistant()


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    return assistant.ask(request)


@app.get("/audit", response_model=list[AuditEvent])
def audit_events() -> list[AuditEvent]:
    """Training-only audit endpoint; production access would be reviewer restricted."""
    return assistant.audit_events


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "data": "fictional-training-only"}
