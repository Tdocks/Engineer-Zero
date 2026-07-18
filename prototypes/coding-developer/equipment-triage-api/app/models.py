from pydantic import BaseModel, Field


class ReadingIn(BaseModel):
    equipment: str = Field(min_length=2, max_length=64)
    temperature: float = Field(ge=-100, le=300)
    vibration: float = Field(ge=0, le=100)
    note: str = Field(default="", max_length=500)


class TriageOut(BaseModel):
    equipment: str
    priority: str
    rationale: str
