from fastapi.testclient import TestClient

from app.main import app


def client(tmp_path, monkeypatch):
    monkeypatch.setenv("HANDOFF_DB_PATH", str(tmp_path / "handoffs.db"))
    with TestClient(app) as test_client:
        yield test_client


def test_creates_handoff_with_human_review_boundary(tmp_path, monkeypatch):
    test_client = next(client(tmp_path, monkeypatch))
    response = test_client.post("/handoffs", json={"notes": "Blocked: fictional telemetry review is waiting. Owner: Cameron. Deadline: 2026-08-01."})
    assert response.status_code == 201
    body = response.json()
    assert body["review_status"] == "needs-human-review"
    assert body["issues"]
    assert body["issues"][0]["owner"] == "Cameron"


def test_retrieves_and_filters_persisted_handoffs(tmp_path, monkeypatch):
    test_client = next(client(tmp_path, monkeypatch))
    created = test_client.post("/handoffs", json={"notes": "Urgent issue: fictional pump review is blocked. Owner: Dana."}).json()
    response = test_client.get("/handoffs", params={"urgency": "URGENT", "owner": "Dana"})
    assert response.status_code == 200
    assert response.json()["count"] == 1
    assert response.json()["handoffs"][0]["id"] == created["id"]


def test_human_review_changes_status_but_model_cannot(tmp_path, monkeypatch):
    test_client = next(client(tmp_path, monkeypatch))
    created = test_client.post("/handoffs", json={"notes": "Review: fictional note needs a human owner."}).json()
    response = test_client.post(f"/handoffs/{created['id']}/review", json={"reviewer": "reviewer-cam", "status": "approved", "note": "Synthetic training review complete."})
    assert response.status_code == 200
    assert response.json()["review_status"] == "approved"


def test_invalid_handoff_is_rejected_before_provider_or_storage(tmp_path, monkeypatch):
    test_client = next(client(tmp_path, monkeypatch))
    response = test_client.post("/handoffs", json={"notes": " "})
    assert response.status_code == 422
