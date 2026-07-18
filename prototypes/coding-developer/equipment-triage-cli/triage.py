"""Pure, deterministic triage rules suitable for direct testing."""

from __future__ import annotations

from typing import TypedDict


class EquipmentReading(TypedDict):
    equipment: str
    temperature: float
    vibration: float
    note: str


def validate_reading(reading: EquipmentReading) -> None:
    if not reading["equipment"].strip():
        raise ValueError("Equipment name is required.")
    if reading["temperature"] < -100 or reading["temperature"] > 300:
        raise ValueError("Temperature is outside the fictional training range.")
    if reading["vibration"] < 0:
        raise ValueError("Vibration cannot be negative.")


def classify_reading(reading: EquipmentReading) -> str:
    """Return a deterministic training priority; this is not real-world policy."""
    if reading["temperature"] >= 90 or reading["vibration"] >= 8:
        return "URGENT"
    if reading["temperature"] >= 80 or reading["vibration"] >= 5:
        return "REVIEW"
    return "NORMAL"
