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


def test_reads_updates_and_deletes_a_specific_issue(tmp_path, monkeypatch):
    temporary = IssueRepository(str(tmp_path / "issues.db"))
    temporary.initialize()
    monkeypatch.setattr("app.main.repository", temporary)
    with TestClient(app) as client:
        created = client.post("/issues", json={"summary": "Pump 7 needs review", "owner": "shift lead"}).json()
        fetched = client.get(f"/issues/{created['id']}")
        updated = client.patch(f"/issues/{created['id']}", json={"status": "RESOLVED"})
        removed = client.delete(f"/issues/{created['id']}")
        missing = client.get(f"/issues/{created['id']}")
    assert fetched.status_code == 200
    assert updated.status_code == 200
    assert updated.json()["owner"] == "shift lead"
    assert updated.json()["status"] == "RESOLVED"
    assert removed.status_code == 204
    assert missing.status_code == 404


def test_rejects_an_empty_issue_update(tmp_path, monkeypatch):
    temporary = IssueRepository(str(tmp_path / "issues.db"))
    temporary.initialize()
    monkeypatch.setattr("app.main.repository", temporary)
    with TestClient(app) as client:
        created = client.post("/issues", json={"summary": "Pump 7 needs review", "owner": "shift lead"}).json()
        response = client.patch(f"/issues/{created['id']}", json={})
    assert response.status_code == 422


def test_rejects_an_incomplete_issue():
    with TestClient(app) as client:
        response = client.post("/issues", json={"summary": "x", "owner": ""})
    assert response.status_code == 422
