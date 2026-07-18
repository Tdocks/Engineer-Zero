from typing import Literal

from pydantic import BaseModel, Field


class ReportIn(BaseModel):
    notes: str = Field(min_length=20, max_length=2000)


class Extraction(BaseModel):
    equipment: str | None = None
    observations: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)


class TriageOut(BaseModel):
    extraction: Extraction
    priority: Literal["NORMAL", "REVIEW", "URGENT"]
    review_status: Literal["needs-human-review"]
    provider: Literal["deterministic-training", "openai", "safe-degraded"]
    fallback_reason: str | None = None
