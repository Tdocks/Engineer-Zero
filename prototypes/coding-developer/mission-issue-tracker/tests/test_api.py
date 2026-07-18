from fastapi.testclient import TestClient

from app.main import app, repository
from app.repository import IssueRepository


def test_create_and_list_issue(tmp_path, monkeypatch):
    temporary = IssueRepository(str(tmp_path / "issues.db"))
    temporary.initialize()
    monkeypatch.setattr("app.main.repository", temporary)
    with TestClient(app) as client:
        created = client.post("/issues", json={"summary": "Pump 7 needs review", "owner": "shift lead", "status": "BLOCKED"})
        listed = client.get("/issues")
    assert created.status_code == 201
    assert created.json()["status"] == "BLOCKED"
    assert listed.json()[0]["owner"] == "shift lead"


def test_rejects_an_incomplete_issue():
    with TestClient(app) as client:
        response = client.post("/issues", json={"summary": "x", "owner": ""})
    assert response.status_code == 422
