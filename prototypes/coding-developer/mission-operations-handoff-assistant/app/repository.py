from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from uuid import UUID

from .models import HandoffOut, ReviewIn


class HandoffRepository:
    def __init__(self, path: str = "handoffs.db") -> None:
        self.path = Path(path)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute("""
                CREATE TABLE IF NOT EXISTS handoffs (
                  id TEXT PRIMARY KEY, payload TEXT NOT NULL,
                  urgency TEXT NOT NULL, owner TEXT, review_status TEXT NOT NULL
                )
            """)
            connection.execute("""
                CREATE TABLE IF NOT EXISTS reviews (
                  handoff_id TEXT NOT NULL, reviewer TEXT NOT NULL,
                  status TEXT NOT NULL, note TEXT NOT NULL,
                  PRIMARY KEY (handoff_id, reviewer)
                )
            """)

    def save(self, handoff: HandoffOut) -> HandoffOut:
        owner = next((issue.owner for issue in handoff.issues if issue.owner), None)
        urgency = next((issue.urgency for issue in handoff.issues if issue.urgency == "URGENT"), handoff.issues[0].urgency if handoff.issues else "REVIEW")
        with self._connect() as connection:
            connection.execute("INSERT INTO handoffs(id, payload, urgency, owner, review_status) VALUES (?, ?, ?, ?, ?)", (str(handoff.id), handoff.model_dump_json(), urgency, owner, handoff.review_status))
        return handoff

    def get(self, handoff_id: UUID) -> HandoffOut | None:
        with self._connect() as connection:
            row = connection.execute("SELECT payload FROM handoffs WHERE id = ?", (str(handoff_id),)).fetchone()
        return HandoffOut.model_validate_json(row["payload"]) if row else None

    def list(self, urgency: str | None = None, owner: str | None = None) -> list[HandoffOut]:
        clauses: list[str] = []
        values: list[str] = []
        if urgency:
            clauses.append("urgency = ?")
            values.append(urgency)
        if owner:
            clauses.append("owner = ?")
            values.append(owner)
        query = "SELECT payload FROM handoffs" + (f" WHERE {' AND '.join(clauses)}" if clauses else "")
        with self._connect() as connection:
            rows = connection.execute(query, values).fetchall()
        return [HandoffOut.model_validate_json(row["payload"]) for row in rows]

    def review(self, handoff_id: UUID, review: ReviewIn) -> HandoffOut | None:
        handoff = self.get(handoff_id)
        if not handoff:
            return None
        updated = handoff.model_copy(update={"review_status": review.status})
        with self._connect() as connection:
            connection.execute("UPDATE handoffs SET payload = ?, review_status = ? WHERE id = ?", (updated.model_dump_json(), review.status, str(handoff_id)))
            connection.execute("INSERT OR REPLACE INTO reviews(handoff_id, reviewer, status, note) VALUES (?, ?, ?, ?)", (str(handoff_id), review.reviewer, review.status, review.note))
        return updated
