from __future__ import annotations

from .models import Extraction, TriageOut
from .providers import ExtractionProvider, ExtractionUnavailable


def deterministic_priority(extraction: Extraction) -> str:
    observations = " ".join(extraction.observations).lower()
    if "temperature 90" in observations or "severe leak" in observations:
        return "URGENT"
    if extraction.uncertainties or observations:
        return "REVIEW"
    return "NORMAL"


def safe_degraded_result(error: Exception) -> TriageOut:
    """Return a visible, non-inventing fallback for an unavailable integration."""
    safe_extraction = Extraction(uncertainties=["Structured extraction is unavailable; a qualified human must review the fictional report directly."])
    return TriageOut(extraction=safe_extraction, priority="REVIEW", review_status="needs-human-review", provider="safe-degraded", fallback_reason=type(error).__name__)


def triage_report(notes: str, provider: ExtractionProvider) -> TriageOut:
    """Always keep final priority and review status in trusted, deterministic code."""
    try:
        extraction = provider.extract(notes)
        return TriageOut(extraction=extraction, priority=deterministic_priority(extraction), review_status="needs-human-review", provider=provider.name)
    except (ExtractionUnavailable, TimeoutError, ValueError) as error:
        return safe_degraded_result(error)
