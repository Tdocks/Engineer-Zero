from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class IssueCreate(BaseModel):
    summary: str = Field(min_length=3, max_length=240)
    owner: str = Field(min_length=2, max_length=80)
    status: Literal["OPEN", "BLOCKED", "RESOLVED"] = "OPEN"


class IssueUpdate(BaseModel):
    """A small PATCH contract for the fictional training tracker.

    Fields are optional because callers may change one aspect of an issue, but
    the route rejects an empty update rather than treating it as a success.
    """

    summary: str | None = Field(default=None, min_length=3, max_length=240)
    owner: str | None = Field(default=None, min_length=2, max_length=80)
    status: Literal["OPEN", "BLOCKED", "RESOLVED"] | None = None


class Issue(BaseModel):
    id: int
    summary: str
    owner: str
    status: Literal["OPEN", "BLOCKED", "RESOLVED"]
    created_at: datetime
