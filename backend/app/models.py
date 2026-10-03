from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel

SubmissionStatus = Literal["uploaded", "processing", "graded", "failed"]


class Assignment(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    created_at: datetime | None = None


class Question(BaseModel):
    id: UUID
    assignment_id: UUID
    number: str
    text: str
    max_marks: int
    answer_key: str | None = None
    rubric: Any | None = None
    created_at: datetime | None = None


class Submission(BaseModel):
    id: UUID
    assignment_id: UUID
    student_name: str
    file_path: str
    status: SubmissionStatus = "uploaded"
    error: str | None = None
    submitted_at: datetime | None = None


class Result(BaseModel):
    id: UUID
    submission_id: UUID
    extraction: Any | None = None
    evaluation: Any | None = None
    total_marks: float | None = None
    max_total: float | None = None
    needs_review: bool = False
    created_at: datetime | None = None


class AssignmentWithQuestions(BaseModel):
    assignment: Assignment
    questions: list[Question]
