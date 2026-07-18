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

- A typed API creates and reads issue records.
- SQLite remains behind a small repository boundary.
- The service emits an intentionally minimal audit-friendly log event.
- Tests cover creation, retrieval, and invalid input.

## Boundaries

SQLite is a teaching choice, not a production recommendation. A real system would require an accountable owner for authorization, retention, encryption, backups, migrations, monitoring, and concurrency design. Never connect this project to operational issue systems.
