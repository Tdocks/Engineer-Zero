from __future__ import annotations

from uuid import uuid4

from .models import ApprovalRequest, AuditEvent, IncidentRequest, Proposal, Severity
from .store import TriageStore


APPROVERS = {"reviewer-cam", "reviewer-drew"}
APPROVED_EVIDENCE = {"log-service-01", "runbook-degrade-02", "metric-latency-03"}


class TriageWorkflow:
    def __init__(self, store: TriageStore | None = None):
        self.store = store or TriageStore()

    def propose(self, request: IncidentRequest, idempotency_key: str) -> Proposal:
        existing = self.store.find_by_idempotency_key(idempotency_key)
        if existing:
            return self._proposal(existing)

        incident_id = str(uuid4())
        action, rationale, escalation = self._policy(request)
        status = "needs-escalation" if escalation else "awaiting-approval"
        self.store.insert_incident({
            "id": incident_id,
            "idempotency_key": idempotency_key,
            "title": request.title,
            "severity": request.severity.value,
            "status": status,
            "action": action,
            "rationale": rationale,
            "escalation_reason": escalation,
        })
        self.store.audit(incident_id, "proposal-created", "workflow", rationale)
        return Proposal(incident_id=incident_id, action=action, rationale=rationale, status=status, requires_approval=not escalation, escalation_reason=escalation)

    def approve(self, incident_id: str, request: ApprovalRequest) -> Proposal:
        incident = self.store.incident(incident_id)
        if not incident:
            raise KeyError("Unknown incident")
        if request.reviewer_id not in APPROVERS:
            raise PermissionError("Reviewer is not qualified for this fictional workflow")
        if incident["status"] != "awaiting-approval":
            return self._proposal(incident)
        if not request.approved:
            self.store.update_status(incident_id, "rejected")
            self.store.audit(incident_id, "approval-rejected", request.reviewer_id, request.note)
            return self._proposal(self.store.incident(incident_id))
        if not self.can_execute(incident):
            self.store.update_status(incident_id, "needs-escalation")
            self.store.audit(incident_id, "execution-blocked", request.reviewer_id, "Policy did not permit execution")
            return self._proposal(self.store.incident(incident_id))
        self.store.update_status(incident_id, "executed")
        self.store.audit(incident_id, "simulated-action-executed", request.reviewer_id, request.note)
        return self._proposal(self.store.incident(incident_id))

    def can_execute(self, incident) -> bool:
        """Only a human-approved, bounded action may execute."""
        return incident["status"] == "awaiting-approval" and incident["severity"] in {"low", "medium", "high"}

    def audit(self, incident_id: str) -> list[AuditEvent]:
        return [AuditEvent(**dict(row)) for row in self.store.events(incident_id)]

    def _policy(self, request: IncidentRequest) -> tuple[str, str, str | None]:
        if request.severity == Severity.critical:
            return ("Escalate to incident commander", "Critical incidents require a qualified incident commander; no automated action is proposed.", "critical-severity")
        if not set(request.evidence_ids).intersection(APPROVED_EVIDENCE):
            return ("Collect approved evidence", "No approved evidence supports a bounded action.", "missing-approved-evidence")
        return ("Enable the fictional degraded-service banner", "A reversible communication action is supported by approved evidence and still needs human approval.", None)

    def _proposal(self, incident) -> Proposal:
        return Proposal(incident_id=incident["id"], action=incident["action"], rationale=incident["rationale"], status=incident["status"], requires_approval=incident["status"] == "awaiting-approval", escalation_reason=incident["escalation_reason"])
