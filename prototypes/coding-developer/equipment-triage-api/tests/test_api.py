from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_a_small_typed_readiness_signal():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "fictional-equipment-triage"}


def test_route_validates_missing_equipment():
    response = client.post("/triage", json={"equipment": "", "temperature": 72, "vibration": 1})
    assert response.status_code == 422


def test_route_returns_typed_result():
    response = client.post("/triage", json={"equipment": "pump-7", "temperature": 82, "vibration": 1})
    assert response.status_code == 200
    assert response.json()["priority"] == "REVIEW"


def test_rules_expose_the_same_synthetic_boundary_used_by_the_service():
    response = client.get("/rules")
    assert response.status_code == 200
    assert response.json()["urgent_temperature"] == 90.0
    assert response.json()["review_vibration"] == 5.0
