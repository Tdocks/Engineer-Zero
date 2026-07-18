from __future__ import annotations

from datetime import date

from .models import Principal, ProcedureDocument


PRINCIPALS: dict[str, Principal] = {
    "eng-ada": Principal(id="eng-ada", roles={"engineer"}, scopes={"facility-a"}),
    "ops-ben": Principal(id="ops-ben", roles={"operations"}, scopes={"facility-b"}),
    "reviewer-cam": Principal(
        id="reviewer-cam", roles={"reviewer"}, scopes={"facility-a", "facility-b"}
    ),
}

DOCUMENTS: list[ProcedureDocument] = [
    ProcedureDocument(
        id="proc-a-pump-r3",
        title="Facility A pump startup checklist",
        body="Confirm guard status, complete the approved pre-start inspection, then escalate any abnormal reading.",
        scope="facility-a",
        revision="R3",
        effective_date=date(2026, 1, 5),
        status="current",
    ),
    ProcedureDocument(
        id="proc-a-pump-r2",
        title="Facility A pump startup checklist",
        body="Superseded fictional checklist. Do not use for operations.",
        scope="facility-a",
        revision="R2",
        effective_date=date(2025, 4, 4),
        status="superseded",
    ),
    ProcedureDocument(
        id="proc-b-prop-r7",
        title="Facility B propulsion servicing",
        body="Fictional restricted servicing procedure.",
        scope="facility-b",
        revision="R7",
        effective_date=date(2026, 2, 1),
        status="current",
    ),
    ProcedureDocument(
        id="proc-a-coolant-r4",
        title="Facility A coolant inspection",
        body="Fictional revision A: stop and escalate if a seal reading is outside tolerance.",
        scope="facility-a",
        revision="R4",
        effective_date=date(2026, 3, 3),
        status="current",
        conflict_group="coolant-inspection",
    ),
    ProcedureDocument(
        id="proc-a-coolant-r4b",
        title="Facility A coolant inspection supplement",
        body="Fictional revision B with a conflicting tolerance instruction; human review required.",
        scope="facility-a",
        revision="R4B",
        effective_date=date(2026, 3, 4),
        status="current",
        conflict_group="coolant-inspection",
    ),
]


class ProcedureRepository:
    def principal(self, principal_id: str) -> Principal | None:
        return PRINCIPALS.get(principal_id)

    def retrieve(self, *, scopes: set[str], question: str) -> list[ProcedureDocument]:
        """Policy-filtered retrieval. Callers must pass only authorized scopes."""
        normalized_question = question.lower()
        query_terms = {term.lower().strip(".,?") for term in question.split() if len(term) > 2}
        requested_scope = next(
            (
                scope
                for scope in {doc.scope for doc in DOCUMENTS}
                if scope.replace("-", " ") in normalized_question
            ),
            None,
        )
        eligible = [
            doc
            for doc in DOCUMENTS
            if doc.scope in scopes
            and doc.status == "current"
            and (requested_scope is None or doc.scope == requested_scope)
        ]
        ranked = sorted(
            eligible,
            key=lambda doc: sum(
                term in (doc.title + " " + doc.body).lower() for term in query_terms
            ),
            reverse=True,
        )
        return [doc for doc in ranked if any(term in (doc.title + " " + doc.body).lower() for term in query_terms)]
