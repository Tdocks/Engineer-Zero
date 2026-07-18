from .models import ReadingIn, TriageOut


def evaluate_reading(reading: ReadingIn) -> TriageOut:
    if reading.temperature >= 90 or reading.vibration >= 8:
        return TriageOut(equipment=reading.equipment, priority="URGENT", rationale="A fictional training threshold requires prompt human review.")
    if reading.temperature >= 80 or reading.vibration >= 5:
        return TriageOut(equipment=reading.equipment, priority="REVIEW", rationale="A fictional training threshold requires review before action.")
    return TriageOut(equipment=reading.equipment, priority="NORMAL", rationale="No fictional training threshold was exceeded.")
