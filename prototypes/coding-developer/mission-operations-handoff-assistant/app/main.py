from __future__ import annotations

import os
from contextlib import asynccontextmanager
from uuid import UUID

from fastapi import FastAPI, HTTPException, Query

from .models import HandoffIn, HandoffList, HandoffOut, ReviewIn
from .providers import configured_provider
from .repository import HandoffRepository
from .service import create_handoff, record_review


@asynccontextmanager
async def lifespan(application: FastAPI):
    application.state.repository = HandoffRepository(os.environ.get("HANDOFF_DB_PATH", "handoffs.db"))
    yield


app = FastAPI(title="Fictional Mission Operations Handoff Assistant", version="0.1.0", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "scope": "fictional-training-only"}


@app.post("/handoffs", response_model=HandoffOut, status_code=201)
def create(request: HandoffIn) -> HandoffOut:
    return create_handoff(request, configured_provider(), app.state.repository)


@app.get("/handoffs", response_model=HandoffList)
def list_handoffs(urgency: str | None = Query(default=None, pattern="^(NORMAL|REVIEW|URGENT)$"), owner: str | None = None) -> HandoffList:
    handoffs = app.state.repository.list(urgency=urgency, owner=owner)
    return HandoffList(handoffs=handoffs, count=len(handoffs))


@app.get("/handoffs/{handoff_id}", response_model=HandoffOut)
def get_handoff(handoff_id: UUID) -> HandoffOut:
    handoff = app.state.repository.get(handoff_id)
    if not handoff:
        raise HTTPException(status_code=404, detail="Fictional handoff not found")
    return handoff


@app.post("/handoffs/{handoff_id}/review", response_model=HandoffOut)
def review_handoff(handoff_id: UUID, review: ReviewIn) -> HandoffOut:
    handoff = record_review(handoff_id, review, app.state.repository)
    if not handoff:
        raise HTTPException(status_code=404, detail="Fictional handoff not found")
    return handoff
