from __future__ import annotations

import sqlite3
from pathlib import Path


class TriageStore:
    def __init__(self, database: str = ":memory:"):
        self.connection = sqlite3.connect(database, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.connection.executescript(
            """
            create table if not exists incidents (
              id text primary key,
              idempotency_key text not null unique,
              title text not null,
              severity text not null,
              status text not null,
              action text not null,
              rationale text not null,
              escalation_reason text
            );
            create table if not exists audit_events (
              id integer primary key autoincrement,
              incident_id text not null,
              event text not null,
              actor text not null,
              detail text not null
            );
            """
        )

    def find_by_idempotency_key(self, key: str):
        return self.connection.execute("select * from incidents where idempotency_key = ?", (key,)).fetchone()

    def insert_incident(self, values: dict[str, str]) -> None:
        self.connection.execute(
            "insert into incidents(id, idempotency_key, title, severity, status, action, rationale, escalation_reason) values(:id, :idempotency_key, :title, :severity, :status, :action, :rationale, :escalation_reason)",
            values,
        )
        self.connection.commit()

    def incident(self, incident_id: str):
        return self.connection.execute("select * from incidents where id = ?", (incident_id,)).fetchone()

    def update_status(self, incident_id: str, status: str) -> None:
        self.connection.execute("update incidents set status = ? where id = ?", (status, incident_id))
        self.connection.commit()

    def audit(self, incident_id: str, event: str, actor: str, detail: str) -> None:
        self.connection.execute("insert into audit_events(incident_id, event, actor, detail) values(?, ?, ?, ?)", (incident_id, event, actor, detail))
        self.connection.commit()

    def events(self, incident_id: str):
        return self.connection.execute("select event, incident_id, actor, detail from audit_events where incident_id = ? order by id", (incident_id,)).fetchall()
