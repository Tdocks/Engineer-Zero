from fastapi import FastAPI, Header, HTTPException

from .models import ApprovalRequest, AuditEvent, IncidentRequest, Proposal
from .service import TriageWorkflow

app = FastAPI(title="Fictional Human-Approved Operations Triage", version="0.1.0")
workflow = TriageWorkflow()


@app.post("/incidents", response_model=Proposal)
def create_incident(request: IncidentRequest, idempotency_key: str = Header(min_length=8, alias="Idempotency-Key")) -> Proposal:
    return workflow.propose(request, idempotency_key)


@app.post("/incidents/{incident_id}/approval", response_model=Proposal)
def approve_incident(incident_id: str, request: ApprovalRequest) -> Proposal:
    try:
        return workflow.approve(incident_id, request)
    except KeyError:
        raise HTTPException(status_code=404, detail="Incident not found")
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error))


@app.get("/incidents/{incident_id}/audit", response_model=list[AuditEvent])
def incident_audit(incident_id: str) -> list[AuditEvent]:
    return workflow.audit(incident_id)
