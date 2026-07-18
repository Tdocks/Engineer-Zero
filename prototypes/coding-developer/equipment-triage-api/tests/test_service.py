from app.models import ReadingIn
from app.service import evaluate_reading


def test_temperature_boundary_is_urgent():
    result = evaluate_reading(ReadingIn(equipment="pump-7", temperature=90, vibration=1))
    assert result.priority == "URGENT"


def test_normal_reading_stays_normal():
    result = evaluate_reading(ReadingIn(equipment="pump-7", temperature=72, vibration=1))
    assert result.priority == "NORMAL"
