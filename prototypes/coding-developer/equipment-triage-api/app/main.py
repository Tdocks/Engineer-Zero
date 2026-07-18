from fastapi import FastAPI

from .models import HealthOut, ReadingIn, RulesOut, TriageOut
from .service import evaluate_reading, published_rules

app = FastAPI(title="Fictional Equipment Triage API", version="0.1.0")


@app.get("/health", response_model=HealthOut)
def health() -> HealthOut:
    """A small readiness signal for this fictional local prototype."""
    return HealthOut(status="ok", service="fictional-equipment-triage")


@app.post("/triage", response_model=TriageOut)
def triage(reading: ReadingIn) -> TriageOut:
    return evaluate_reading(reading)


@app.get("/rules", response_model=RulesOut)
def rules() -> RulesOut:
    """Expose the synthetic rule boundary so a learner can inspect and test it."""
    return published_rules()
