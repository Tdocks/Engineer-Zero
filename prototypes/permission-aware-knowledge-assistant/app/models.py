from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class Principal(BaseModel):
    id: str
    roles: set[str]
    scopes: set[str]


class ProcedureDocument(BaseModel):
    id: str
    title: str
    body: str
    scope: str
    revision: str
    effective_date: date
    status: Literal["current", "superseded"]
    conflict_group: str | None = None


class AskRequest(BaseModel):
    principal_id: str = Field(min_length=3, max_length=40)
    question: str = Field(min_length=8, max_length=500)


class Citation(BaseModel):
    document_id: str
    title: str
    revision: str


class AskResponse(BaseModel):
    correlation_id: str
    status: Literal["answered", "abstained", "denied"]
    answer: str
    citations: list[Citation] = []
    escalation_reason: str | None = None


class AuditEvent(BaseModel):
    correlation_id: str
    principal_id: str
    decision: Literal["answered", "abstained", "denied"]
    retrieved_document_ids: list[str]
    reason: str | None = None
