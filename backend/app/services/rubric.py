"""Rubric generation service.

generate_rubric(question: dict) -> list[Criterion dicts]
  Each criterion: {name, description, max_marks}
  Criteria max_marks must sum to question["max_marks"].
"""
from __future__ import annotations

import math

from app.config import settings


def generate_rubric(question: dict) -> list[dict]:
    if not settings.mock_ai:
        raise NotImplementedError("Real rubric generation (Gemma) not yet integrated.")
    return _mock_rubric(question)


def _mock_rubric(question: dict) -> list[dict]:
    total: int = question["max_marks"]

    # Split marks into 3 criteria proportionally (rounding last to absorb error)
    thirds = [math.floor(total / 3)] * 3
    thirds[2] = total - thirds[0] - thirds[1]

    templates = [
        {
            "name": "Conceptual Understanding",
            "description": (
                "Demonstrates correct understanding of the core concept "
                f"asked in question {question['number']}."
            ),
        },
        {
            "name": "Accuracy & Detail",
            "description": "Provides accurate facts, units, or calculations with sufficient detail.",
        },
        {
            "name": "Clarity & Structure",
            "description": "Answer is clearly written, well-structured, and free from contradictions.",
        },
    ]

    return [
        {**t, "max_marks": float(m)}
        for t, m in zip(templates, thirds)
        if m > 0
    ]
