# Mission Issue Tracker

Week 2 of Coding Developer uses this fictional FastAPI and SQLite project to practice persistence, service boundaries, logging, API contracts, and tests. It contains no real mission or organizational data.

## Run it

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m pytest
uvicorn app.main:app --reload
```

## What it demonstrates

- A typed API creates, reads, updates, and deletes fictional issue records.
- SQLite remains behind a small repository boundary.
- The service emits an intentionally minimal audit-friendly log event.
- Tests cover creation, retrieval, a partial update, deletion, and invalid input.

## API contract

- `POST /issues` creates a fictional issue.
- `GET /issues` lists fictional issues.
- `GET /issues/{issue_id}` retrieves one issue.
- `PATCH /issues/{issue_id}` changes one or more fields; an empty update is rejected.
- `DELETE /issues/{issue_id}` removes one issue and returns `204`.

This is deliberately small CRUD practice. It has no identity, authorization,
retention, backups, migration process, or multi-user concurrency design.

## Boundaries

SQLite is a teaching choice, not a production recommendation. A real system would require an accountable owner for authorization, retention, encryption, backups, migrations, monitoring, and concurrency design. Never connect this project to operational issue systems.
