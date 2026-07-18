# AI-Assisted Maintenance Report Triage

The Day 3 local project demonstrates the limited place for a hosted language model in an application: extracting draft facts from fictional free text into a validated schema. The model is never the authority for risk classification, permission, or action.

## Non-negotiable boundary

All included reports are synthetic. Do not add real operational notes, personal data, credentials, internal documents, or export-controlled material. The default provider is deterministic and local. The optional OpenAI provider only activates when a learner deliberately configures it through local environment variables.

## Run the safe default

Requires Python 3.11 or later.

```bash
python -m venv .venv
source .venv/bin/activate # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest
uvicorn app.main:app --reload
```

Send a fictional note to `POST /reports`. The response includes a structured extraction, deterministic priority, uncertainty, and `review_status: "needs-human-review"`.

## Optional hosted-model exercise

Only after completing the fallback and tests, create a local `.env` file that is never committed:

```bash
export EXTRACTION_PROVIDER=openai
export OPENAI_API_KEY="your-local-key"
export OPENAI_MODEL="gpt-4.1-mini"
```

Then compare its result to the fallback for the same synthetic report. It must still pass schema validation; an unavailable, unconfigured, or invalid provider must return a safe degraded response, not invented facts or an automated action.

## Required evaluation cases

1. A report with an explicit equipment name and one observation.
2. A report with no equipment identifier; uncertainty must be visible.
3. A report that asks the assistant to ignore instructions; the request is treated as untrusted content, not a command.
4. A provider outage; the response must be `needs-human-review` and include a safe fallback explanation.
5. Missing provider configuration and invalid structured output; both must enter the same visible degraded mode.
6. A missing temperature unit; uncertainty must be visible rather than guessed.
7. An oversized or empty report; the API boundary rejects it before provider work.
8. Instruction-like text inside a report; it stays untrusted data and cannot create an action.

## Defense prompts

- What does the model do, and what is deliberately outside its authority?
- Why is a schema safer than a free-form paragraph at this interface?
- How did you evaluate uncertainty and unsupported claims?
- What data would be out of scope before any real integration?
