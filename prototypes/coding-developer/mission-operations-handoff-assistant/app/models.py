from __future__ import annotations

from datetime import UTC, datetime
from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, field_validator


Urgency = Literal["NORMAL", "REVIEW", "URGENT"]
ReviewStatus = Literal["needs-human-review", "approved", "changes-requested"]


class HandoffIn(BaseModel):
    notes: str = Field(min_length=8, max_length=8_000, description="Fictional free-text handoff notes only.")

    @field_validator("notes")
    @classmethod
    def notes_cannot_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Handoff notes cannot be blank.")
        return value.strip()


class Issue(BaseModel):
    summary: str
    owner: str | None = None
    deadline: str | None = None
    urgency: Urgency
    unresolved_question: str | None = None


class HandoffOut(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    notes: str
    issues: list[Issue]
    uncertainties: list[str] = Field(default_factory=list)
    review_status: ReviewStatus = "needs-human-review"
    provider: str
    degraded_mode: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class ReviewIn(BaseModel):
    reviewer: str = Field(min_length=2, max_length=120)
    status: Literal["approved", "changes-requested"]
    note: str = Field(min_length=4, max_length=2_000)


class HandoffList(BaseModel):
    handoffs: list[HandoffOut]
    count: int
