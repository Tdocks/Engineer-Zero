# Equipment Triage API

The Day 2 local project evolves the fictional Day 1 command-line utility into a tested API. It demonstrates a narrow, inspectable service boundary: FastAPI receives and validates a request; a pure Python service applies the deterministic rule; a typed response returns the result.

## Run it

Requires Python 3.11 or later.

```bash
python -m venv .venv
source .venv/bin/activate # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs`. Everything in this project is fictional training data.

## Architecture

```mermaid
flowchart LR
  C[Fictional client] --> A[FastAPI route]
  A --> M[Typed request model]
  M --> S[Pure triage service]
  S --> R[Typed response]
```

## Exercises

1. Send a reading at exactly `90` temperature units. What does the service return, and which test proves it?
2. Submit an empty `equipment` field. Why is this rejected at the boundary instead of being handled in the triage rule?
3. Move the threshold rule into `app/main.py`. Notice which direct service tests no longer make sense; restore the separation.
4. Add one test for vibration-triggered urgency.

## What to defend

- Why choose FastAPI for this small API rather than a script?
- Why keep request validation and business rules separate?
- What would change before exposing an equivalent service to more users?
