from fastapi import FastAPI

from .models import ReadingIn, TriageOut
from .service import evaluate_reading

app = FastAPI(title="Fictional Equipment Triage API", version="0.1.0")


@app.post("/triage", response_model=TriageOut)
def triage(reading: ReadingIn) -> TriageOut:
    return evaluate_reading(reading)
