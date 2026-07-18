import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, status

from .models import Issue, IssueCreate
from .repository import IssueRepository

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
logger = logging.getLogger("mission-issue-tracker")

repository = IssueRepository(os.getenv("ISSUE_DB_PATH", "issues.db"))


@asynccontextmanager
async def lifespan(_: FastAPI):
    repository.initialize()
    yield


app = FastAPI(title="Fictional Mission Issue Tracker", lifespan=lifespan)


@app.post("/issues", response_model=Issue, status_code=status.HTTP_201_CREATED)
def create_issue(request: IssueCreate) -> Issue:
    issue = repository.create(request)
    logger.info("issue_created id=%s status=%s", issue.id, issue.status)
    return issue


@app.get("/issues", response_model=list[Issue])
def list_issues() -> list[Issue]:
    return repository.list_all()
