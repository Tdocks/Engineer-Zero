"""A fictional, local-only equipment status triage utility."""

from __future__ import annotations

import json
from pathlib import Path

from triage import classify_reading, validate_reading


def ask_number(label: str) -> float:
    raw_value = input(f"{label}: ").strip()
    try:
        return float(raw_value)
    except ValueError as error:
        raise ValueError(f"{label} must be a number.") from error


def main() -> None:
    print("Fictional Equipment Status Triage — synthetic practice only")
    reading = {
        "equipment": input("Equipment name: ").strip(),
        "temperature": ask_number("Temperature"),
        "vibration": ask_number("Vibration"),
        "note": input("Status note: ").strip(),
    }
    validate_reading(reading)
    result = {**reading, "priority": classify_reading(reading)}
    print(f"\n{result['equipment']}: {result['priority']}")
    print(f"Reason: {result['note'] or 'No free-text note supplied.'}")
    output_path = Path("triage-result.json")
    output_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"Saved fictional result to {output_path.resolve()}")


if __name__ == "__main__":
    try:
        main()
    except ValueError as error:
        print(f"Input error: {error}")
