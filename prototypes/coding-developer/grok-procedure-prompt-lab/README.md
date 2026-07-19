# Grok procedure prompt lab (local)

Practice the same three Few-Day fixtures against live Grok using a **local** `XAI_API_KEY`. Never paste the key into the Engineer Zero web UI.

## Setup

```bash
export XAI_API_KEY='your-xai-key'
cd prototypes/coding-developer/grok-procedure-prompt-lab
python3 run_fixtures.py
```

Without a key, the script prints deterministic fallback JSON (same shapes as `/api/course/grok-practice`).

## Fixtures

1. `classify-cite` — cited answer from authorized SOP text  
2. `abstain-conflict` — conflict → abstain, no silent pick  
3. `schema-repair` — unsupported question → JSON abstain  

Copy the printed `requestId`, `mode`, and pass/fail notes into **aio-lab-grok-live** RUN-TRACE lines.
