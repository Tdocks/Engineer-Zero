from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_route_validates_missing_equipment():
    response = client.post("/triage", json={"equipment": "", "temperature": 72, "vibration": 1})
    assert response.status_code == 422


def test_route_returns_typed_result():
    response = client.post("/triage", json={"equipment": "pump-7", "temperature": 82, "vibration": 1})
    assert response.status_code == 200
    assert response.json()["priority"] == "REVIEW"
