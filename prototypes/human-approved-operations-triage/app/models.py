from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field


class Severity(StrEnum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class IncidentRequest(BaseModel):
    title: str = Field(min_length=8, max_length=120)
    summary: str = Field(min_length=20, max_length=1200)
    severity: Severity
    evidence_ids: list[str] = Field(default_factory=list, max_length=8)


class Proposal(BaseModel):
    incident_id: str
    action: str
    rationale: str
    status: StrEnum | str
    requires_approval: bool
    escalation_reason: str | None = None


class ApprovalRequest(BaseModel):
    reviewer_id: str = Field(min_length=3, max_length=40)
    approved: bool
    note: str = Field(min_length=8, max_length=500)


class AuditEvent(BaseModel):
    event: str
    incident_id: str
    actor: str
    detail: str
