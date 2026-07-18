from app.providers import DeterministicTrainingProvider
from app.service import triage_report


def test_extraction_keeps_human_review_boundary():
    result = triage_report("Equipment: pump-7. Vibration is elevated in this synthetic exercise.", DeterministicTrainingProvider())
    assert result.extraction.equipment == "pump-7"
    assert result.review_status == "needs-human-review"
    assert result.priority == "REVIEW"


def test_missing_equipment_is_visible_uncertainty():
    result = triage_report("A synthetic report mentions a leak but does not name an asset.", DeterministicTrainingProvider())
    assert result.extraction.equipment is None
    assert result.extraction.uncertainties


class FailingProvider:
    name = "test-provider"

    def extract(self, notes):
        raise TimeoutError("Synthetic outage")


def test_provider_outage_is_safe_degraded_mode():
    result = triage_report("Fictional note for outage test.", FailingProvider())
    assert result.provider == "safe-degraded"
    assert result.priority == "REVIEW"
    assert result.review_status == "needs-human-review"
