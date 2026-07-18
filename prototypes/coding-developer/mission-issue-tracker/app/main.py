import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Response, status

from .models import Issue, IssueCreate, IssueUpdate
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


@app.get("/issues/{issue_id}", response_model=Issue)
def get_issue(issue_id: int) -> Issue:
    issue = repository.get(issue_id)
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fictional issue not found")
    return issue


@app.patch("/issues/{issue_id}", response_model=Issue)
def update_issue(issue_id: int, request: IssueUpdate) -> Issue:
    if not request.model_fields_set:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Provide at least one field to update")
    issue = repository.update(issue_id, request)
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fictional issue not found")
    logger.info("issue_updated id=%s changed_fields=%s", issue_id, sorted(request.model_fields_set))
    return issue


@app.delete("/issues/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(issue_id: int) -> Response:
    if not repository.delete(issue_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fictional issue not found")
    logger.info("issue_deleted id=%s", issue_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
