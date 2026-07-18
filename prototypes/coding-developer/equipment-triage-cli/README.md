# Equipment Status Triage CLI

The Day 1 local project for the Coding Developer program. It is deliberately small: it accepts fictional equipment readings, validates them, applies deterministic thresholds, prints a clear result, and writes a JSON record.

## What this is—and is not

This is a learning prototype. It uses synthetic information only and is **not** approved for equipment monitoring, operational decisions, or connection to a real system. The rules are intentionally deterministic so the learner can test and explain them.

## Run it

Requires Python 3.11 or later.

```bash
python -m venv .venv
source .venv/bin/activate # Windows PowerShell: .venv\Scripts\Activate.ps1
python main.py
python -m unittest discover -s tests
```

## What to defend

1. Why is the reading represented as a dictionary-shaped record?
2. What happens when a user enters a non-numeric temperature?
3. Which rules are deterministic, and why would an LLM make those rules worse?
4. Which boundary condition has a test?

## Deliberate repair exercise

Temporarily change the urgent threshold in `triage.py` from `90` to `91`. Run the tests, explain the failure, restore the correct threshold, then add a test for a vibration-only urgent reading.

## AI assistance disclosure

If AI helped, record exactly what it helped draft, which code you changed, the tests you ran, and one behavior you can now explain without the tool. Do not describe a generated answer as independent work.
