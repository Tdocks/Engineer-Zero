from __future__ import annotations

from .models import HandoffIn, HandoffOut, ReviewIn
from .providers import HandoffProvider, ProviderUnavailable
from .repository import HandoffRepository


def create_handoff(request: HandoffIn, provider: HandoffProvider, repository: HandoffRepository) -> HandoffOut:
    try:
        issues, uncertainties = provider.extract(request.notes)
        handoff = HandoffOut(notes=request.notes, issues=issues, uncertainties=uncertainties, provider=provider.name)
    except ProviderUnavailable as error:
        handoff = HandoffOut(
            notes=request.notes,
            issues=[],
            uncertainties=["Structured extraction is unavailable. A qualified human must read these fictional notes directly."],
            provider="safe-degraded",
            degraded_mode=True,
        )
    return repository.save(handoff)


def record_review(handoff_id, review: ReviewIn, repository: HandoffRepository) -> HandoffOut | None:
    return repository.review(handoff_id, review)
