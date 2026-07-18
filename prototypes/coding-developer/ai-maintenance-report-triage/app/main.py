from fastapi import FastAPI

from .models import ReportIn, TriageOut
from .providers import configured_provider
from .service import safe_degraded_result, triage_report

app = FastAPI(title="Fictional AI-Assisted Maintenance Triage", version="0.1.0")


@app.post("/reports", response_model=TriageOut)
def analyze_report(report: ReportIn) -> TriageOut:
    try:
        provider = configured_provider()
    except RuntimeError as error:
        return safe_degraded_result(error)
    return triage_report(report.notes, provider)
