from app.models import AskRequest
from app.service import KnowledgeAssistant


def test_authorization_filters_before_retrieval():
    service = KnowledgeAssistant()
    response = service.ask(AskRequest(principal_id="ops-ben", question="What is the Facility A pump startup checklist?"))
    assert response.status == "abstained"
    assert response.citations == []
    assert service.audit_events[-1].retrieved_document_ids == []


def test_current_authorized_source_is_cited():
    service = KnowledgeAssistant()
    response = service.ask(AskRequest(principal_id="eng-ada", question="What is the pump startup checklist?"))
    assert response.status == "answered"
    assert response.citations[0].document_id == "proc-a-pump-r3"
    assert "R2" not in response.answer


def test_conflicting_sources_abstain_and_escalate():
    service = KnowledgeAssistant()
    response = service.ask(AskRequest(principal_id="eng-ada", question="What does the coolant inspection say?"))
    assert response.status == "abstained"
    assert "conflict" in (response.escalation_reason or "").lower()


def test_unsupported_answer_abstains():
    service = KnowledgeAssistant()
    response = service.ask(AskRequest(principal_id="eng-ada", question="What is the fictional orbital weather plan?"))
    assert response.status == "abstained"
