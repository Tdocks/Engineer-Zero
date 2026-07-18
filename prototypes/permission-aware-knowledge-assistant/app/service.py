from __future__ import annotations

from uuid import uuid4

from .models import AskRequest, AskResponse, AuditEvent, Citation, ProcedureDocument
from .repository import ProcedureRepository


class KnowledgeAssistant:
    def __init__(self, repository: ProcedureRepository | None = None):
        self.repository = repository or ProcedureRepository()
        self.audit_events: list[AuditEvent] = []

    def ask(self, request: AskRequest) -> AskResponse:
        correlation_id = str(uuid4())
        principal = self.repository.principal(request.principal_id)
        if principal is None:
            return self._deny(correlation_id, request.principal_id, "Unknown fictional principal.")

        # Authorization is deliberately evaluated before retrieval.
        allowed_scopes = principal.scopes
        retrieved = self.repository.retrieve(scopes=allowed_scopes, question=request.question)
        if not retrieved:
            return self._abstain(
                correlation_id,
                principal.id,
                [],
                "No current authorized source supports this answer. Escalate to the procedure owner.",
            )
        if self._has_conflict(retrieved):
            return self._abstain(
                correlation_id,
                principal.id,
                [doc.id for doc in retrieved],
                "Current authorized sources conflict. Do not infer a resolution; escalate to the qualified owner.",
            )

        evidence = retrieved[0]
        response = AskResponse(
            correlation_id=correlation_id,
            status="answered",
            answer=(
                "Based only on the current authorized fictional source: "
                + evidence.body
            ),
            citations=[Citation(document_id=evidence.id, title=evidence.title, revision=evidence.revision)],
        )
        self.audit_events.append(
            AuditEvent(
                correlation_id=correlation_id,
                principal_id=principal.id,
                decision="answered",
                retrieved_document_ids=[evidence.id],
            )
        )
        return response

    def _has_conflict(self, documents: list[ProcedureDocument]) -> bool:
        groups = [doc.conflict_group for doc in documents if doc.conflict_group]
        return any(groups.count(group) > 1 for group in groups)

    def _deny(self, correlation_id: str, principal_id: str, reason: str) -> AskResponse:
        self.audit_events.append(
            AuditEvent(correlation_id=correlation_id, principal_id=principal_id, decision="denied", retrieved_document_ids=[], reason=reason)
        )
        return AskResponse(correlation_id=correlation_id, status="denied", answer="Access denied. Use an approved escalation path.", escalation_reason=reason)

    def _abstain(self, correlation_id: str, principal_id: str, document_ids: list[str], reason: str) -> AskResponse:
        self.audit_events.append(
            AuditEvent(correlation_id=correlation_id, principal_id=principal_id, decision="abstained", retrieved_document_ids=document_ids, reason=reason)
        )
        return AskResponse(correlation_id=correlation_id, status="abstained", answer="I cannot provide a supported answer for this request.", escalation_reason=reason)
