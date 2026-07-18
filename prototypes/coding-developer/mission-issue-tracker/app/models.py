from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class IssueCreate(BaseModel):
    summary: str = Field(min_length=3, max_length=240)
    owner: str = Field(min_length=2, max_length=80)
    status: Literal["OPEN", "BLOCKED", "RESOLVED"] = "OPEN"


class Issue(BaseModel):
    id: int
    summary: str
    owner: str
    status: Literal["OPEN", "BLOCKED", "RESOLVED"]
    created_at: datetime
