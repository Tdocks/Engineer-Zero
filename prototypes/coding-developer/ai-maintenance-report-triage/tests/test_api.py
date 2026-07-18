from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_empty_report_is_rejected_by_the_request_boundary():
    response = client.post("/reports", json={"notes": ""})
    assert response.status_code == 422


def test_excessively_long_report_is_rejected_by_the_request_boundary():
    response = client.post("/reports", json={"notes": "x" * 2001})
    assert response.status_code == 422


def test_missing_configured_provider_returns_safe_degraded_response(monkeypatch):
    monkeypatch.setenv("EXTRACTION_PROVIDER", "openai")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_MODEL", raising=False)
    response = client.post("/reports", json={"notes": "Equipment: pump-7. Vibration is elevated in this synthetic exercise."})
    assert response.status_code == 200
    assert response.json()["provider"] == "safe-degraded"
    assert response.json()["review_status"] == "needs-human-review"
