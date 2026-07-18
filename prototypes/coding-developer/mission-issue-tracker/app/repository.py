import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from .models import Issue, IssueCreate


class IssueRepository:
    """A deliberately small SQLite boundary. It is not a production data service."""

    def __init__(self, database_path: str = "issues.db") -> None:
        self.database_path = database_path

    def _connection(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def initialize(self) -> None:
        Path(self.database_path).parent.mkdir(parents=True, exist_ok=True)
        with self._connection() as connection:
            connection.execute(
                """CREATE TABLE IF NOT EXISTS issues (
                    id INTEGER PRIMARY KEY,
                    summary TEXT NOT NULL,
                    owner TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )"""
            )

    def create(self, request: IssueCreate) -> Issue:
        created_at = datetime.now(timezone.utc)
        with self._connection() as connection:
            cursor = connection.execute(
                "INSERT INTO issues (summary, owner, status, created_at) VALUES (?, ?, ?, ?)",
                (request.summary, request.owner, request.status, created_at.isoformat()),
            )
        return Issue(id=cursor.lastrowid, **request.model_dump(), created_at=created_at)

    def list_all(self) -> list[Issue]:
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT id, summary, owner, status, created_at FROM issues ORDER BY id"
            ).fetchall()
        return [Issue(**dict(row)) for row in rows]
