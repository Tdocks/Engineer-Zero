#!/usr/bin/env python3
"""Bounded Grok practice fixtures. Uses XAI_API_KEY when set; else deterministic fallback."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

BASE_URL = "https://api.x.ai/v1/chat/completions"
MODEL = "grok-4.5"

TASKS = [
    {
        "id": "classify-cite",
        "system": (
            "You are a read-only procedure assistant. Answer only from authorized cited procedures. "
            'Return JSON: {"status":"answer"|"abstain","citations":[],"conflict":false,"reason":""}. '
            "Never invent values."
        ),
        "user": (
            "Authorized evidence:\n"
            "- SOP-12 Rev C: Lock out valve V-12 before opening the bay panel.\n"
            "Question: What is the lockout step for Line B valve V-12?"
        ),
        "fallback": {
            "status": "answer",
            "citations": ["SOP-12 Rev C"],
            "reason": "Lock out valve V-12 before opening the bay panel.",
        },
    },
    {
        "id": "abstain-conflict",
        "system": (
            "You are a read-only procedure assistant. If authorized sources conflict on a consequential "
            "step, set status=abstain, conflict=true, and name both citations. Never silently pick."
        ),
        "user": (
            "Authorized evidence:\n"
            "- Bulletin R8-A: Cool-down wait is 15 minutes.\n"
            "- Bulletin R8-B: Cool-down wait is 30 minutes.\n"
            "Question: How long should we wait before restart?"
        ),
        "fallback": {
            "status": "abstain",
            "citations": ["Bulletin R8-A", "Bulletin R8-B"],
            "conflict": True,
            "reason": "Authorized sources conflict on cool-down wait; escalate to content owner.",
        },
    },
    {
        "id": "schema-repair",
        "system": (
            'Return ONLY valid JSON matching {"status":"answer"|"abstain","citations":[],'
            '"conflict":false,"reason":""}. If you cannot cite an authorized source, abstain.'
        ),
        "user": (
            "Authorized evidence: none for this question.\n"
            "Question: How long until the pump cools after shutdown?"
        ),
        "fallback": {
            "status": "abstain",
            "citations": [],
            "reason": "No authorized supporting source for cool-down duration.",
        },
    },
]


def call_grok(api_key: str, system: str, user: str) -> tuple[str, str]:
    payload = json.dumps(
        {
            "model": MODEL,
            "temperature": 0,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        BASE_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        body = json.loads(response.read().decode("utf-8"))
        request_id = response.headers.get("x-request-id") or f"live-{datetime.now(timezone.utc).timestamp()}"
        content = body["choices"][0]["message"]["content"]
        return content, str(request_id)


def main() -> int:
    api_key = os.environ.get("XAI_API_KEY", "").strip()
    print(f"model={MODEL}")
    print(f"key_configured={bool(api_key)}")
    for task in TASKS:
        print("\n===", task["id"], "===")
        if not api_key:
            result = {
                "mode": "fallback",
                "taskId": task["id"],
                "requestId": f"fallback-{task['id']}",
                "output": task["fallback"],
                "message": "Set XAI_API_KEY for live calls.",
            }
            print(json.dumps(result, indent=2))
            continue
        try:
            raw, request_id = call_grok(api_key, task["system"], task["user"])
            result = {
                "mode": "live",
                "taskId": task["id"],
                "requestId": request_id,
                "rawText": raw[:800],
                "message": "Live call completed. Parse JSON for schema pass/fail in your lab notes.",
            }
            print(json.dumps(result, indent=2))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")[:200]
            result = {
                "mode": "fallback",
                "taskId": task["id"],
                "requestId": f"error-{task['id']}",
                "output": task["fallback"],
                "message": f"HTTP {exc.code}: {detail}",
            }
            print(json.dumps(result, indent=2), file=sys.stderr)
            print(json.dumps(result, indent=2))
        except Exception as exc:  # noqa: BLE001 — local practice script
            result = {
                "mode": "fallback",
                "taskId": task["id"],
                "requestId": f"error-{task['id']}",
                "output": task["fallback"],
                "message": str(exc),
            }
            print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
