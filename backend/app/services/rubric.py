"""Rubric generation service.

generate_rubric(question: dict) -> list[Criterion dicts]
  Each criterion: {name, description, max_marks}
  Criteria max_marks must sum to question["max_marks"].
"""
from __future__ import annotations

import math

from app.config import settings


from app.services.gemma_client import call_gemma_json
import logging

logger = logging.getLogger(__name__)

def generate_rubric(question: dict) -> list[dict]:
    if not settings.mock_ai:
        return _real_rubric(question)
    return _mock_rubric(question)


def _real_rubric(question: dict) -> list[dict]:
    sys_prompt = (
        "You generate grading rubrics. Output ONLY a JSON object with a 'criteria' array.\n"
        "Each criterion must have: 'name' (string), 'description' (string), and 'max_marks' (float).\n"
        "Generate 3 to 5 criteria that are independently checkable.\n"
        "CRITICAL: The sum of max_marks across all criteria MUST EXACTLY equal the question's total max marks."
    )
    
    total = float(question["max_marks"])
    user_prompt = (
        f"Question number: {question['number']}\n"
        f"Question text: {question['text']}\n"
        f"Answer key: {question.get('answer_key', '')}\n"
        f"Total max marks: {total}\n"
    )

    for attempt in range(2):
        try:
            result = call_gemma_json(sys_prompt, user_prompt)
            criteria = result.get("criteria", [])
            
            # Validate sum
            current_sum = sum(c.get("max_marks", 0.0) for c in criteria)
            if abs(current_sum - total) < 0.01:
                return criteria
                
            logger.warning(f"Rubric sum mismatch (attempt {attempt+1}): {current_sum} != {total}")
            
        except Exception as e:
            logger.error(f"Rubric generation error (attempt {attempt+1}): {e}")
            if attempt == 1:
                raise

    # Rescale proportionally if it fails validation twice
    logger.warning("Rescaling rubric marks to match total")
    criteria = result.get("criteria", [])
    current_sum = sum(c.get("max_marks", 0.0) for c in criteria)
    if current_sum <= 0:
        # Fallback to mock if it's completely broken
        return _mock_rubric(question)
        
    for c in criteria:
        c["max_marks"] = round((c.get("max_marks", 0.0) / current_sum) * total, 2)
        
    return criteria


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
