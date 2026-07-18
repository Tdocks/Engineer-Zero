from app.models import ApprovalRequest, IncidentRequest, Severity
from app.service import TriageWorkflow


def supported_request() -> IncidentRequest:
    return IncidentRequest(title="Fictional latency degradation", summary="The synthetic service latency crossed the fictional alert threshold and approved logs confirm the condition.", severity=Severity.high, evidence_ids=["log-service-01"])


def test_supported_action_waits_for_human_approval():
    workflow = TriageWorkflow()
    proposal = workflow.propose(supported_request(), "incident-key-0001")
    assert proposal.status == "awaiting-approval"
    assert proposal.requires_approval


def test_unapproved_action_cannot_execute():
    workflow = TriageWorkflow()
    proposal = workflow.propose(supported_request(), "incident-key-0002")
    assert proposal.status != "executed"


def test_qualified_human_approval_executes_once():
    workflow = TriageWorkflow()
    proposal = workflow.propose(supported_request(), "incident-key-0003")
    first = workflow.approve(proposal.incident_id, ApprovalRequest(reviewer_id="reviewer-cam", approved=True, note="Evidence and boundary reviewed."))
    second = workflow.approve(proposal.incident_id, ApprovalRequest(reviewer_id="reviewer-cam", approved=True, note="Retry after lost client response."))
    assert first.status == "executed"
    assert second.status == "executed"
    assert [event.event for event in workflow.audit(proposal.incident_id)].count("simulated-action-executed") == 1


def test_critical_incident_escalates_without_action():
    workflow = TriageWorkflow()
    request = supported_request().model_copy(update={"severity": Severity.critical})
    proposal = workflow.propose(request, "incident-key-0004")
    assert proposal.status == "needs-escalation"
    assert proposal.escalation_reason == "critical-severity"


def test_idempotency_returns_same_proposal():
    workflow = TriageWorkflow()
    first = workflow.propose(supported_request(), "incident-key-0005")
    second = workflow.propose(supported_request(), "incident-key-0005")
    assert first.incident_id == second.incident_id
