from .models import ReadingIn, RulesOut, TriageOut


REVIEW_TEMPERATURE = 80.0
URGENT_TEMPERATURE = 90.0
REVIEW_VIBRATION = 5.0
URGENT_VIBRATION = 8.0


def evaluate_reading(reading: ReadingIn) -> TriageOut:
    if reading.temperature >= URGENT_TEMPERATURE or reading.vibration >= URGENT_VIBRATION:
        return TriageOut(equipment=reading.equipment, priority="URGENT", rationale="A fictional training threshold requires prompt human review.")
    if reading.temperature >= REVIEW_TEMPERATURE or reading.vibration >= REVIEW_VIBRATION:
        return TriageOut(equipment=reading.equipment, priority="REVIEW", rationale="A fictional training threshold requires review before action.")
    return TriageOut(equipment=reading.equipment, priority="NORMAL", rationale="No fictional training threshold was exceeded.")


def published_rules() -> RulesOut:
    """Return the synthetic, deterministic rules used by this learning service."""
    return RulesOut(
        review_temperature=REVIEW_TEMPERATURE,
        urgent_temperature=URGENT_TEMPERATURE,
        review_vibration=REVIEW_VIBRATION,
        urgent_vibration=URGENT_VIBRATION,
        policy_note="Fictional training thresholds only; a real system needs accountable policy owners.",
    )
