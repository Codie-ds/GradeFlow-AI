"""
API request/response schemas (separate from DB models in models.py).
"""
from __future__ import annotations

from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


# ── Assignment ────────────────────────────────────────────────────────────────

class QuestionIn(BaseModel):
    number: str
    text: str
    max_marks: int = Field(gt=0)
    answer_key: str | None = None


class AssignmentIn(BaseModel):
    title: str = Field(min_length=1)
    description: str | None = None
    questions: list[QuestionIn] = Field(min_length=1)


class QuestionOut(BaseModel):
    id: UUID
    assignment_id: UUID
    number: str
    text: str
    max_marks: int
    answer_key: str | None = None
    rubric: Any | None = None


class AssignmentOut(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    questions: list[QuestionOut] = []


# ── Submission ────────────────────────────────────────────────────────────────

class SubmissionOut(BaseModel):
    id: UUID
    assignment_id: UUID
    student_name: str
    file_path: str
    status: str
    error: str | None = None
    result: Any | None = None   # populated by GET /submissions/{id}


# ── Rubric ────────────────────────────────────────────────────────────────────

class Criterion(BaseModel):
    name: str
    description: str
    max_marks: float


class RubricOut(BaseModel):
    question_id: UUID
    number: str
    criteria: list[Criterion]


class RubricsResponse(BaseModel):
    assignment_id: UUID
    rubrics: list[RubricOut]
