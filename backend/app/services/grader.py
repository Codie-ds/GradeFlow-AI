"""Grading service.

grade_answers(extraction, questions_with_rubrics) -> grading result dict:
  {
    "evaluation": {
      "1": {
        "criteria": [
          {"name": str, "max": float, "awarded": float,
           "evidence": str, "reason": str, "confidence": float}
        ],
        "question_total": float,
        "question_max": float
      }
    },
    "total_marks": float,
    "max_total": float,
    "needs_review": bool   # true if any confidence < 0.6
  }
"""
from __future__ import annotations

import random

from app.config import settings


def grade_answers(extraction: list[dict], questions_with_rubrics: list[dict]) -> dict:
    if not settings.mock_ai:
        raise NotImplementedError("Real grading (Gemma) not yet integrated.")
    return _mock_grade(extraction, questions_with_rubrics)


def _mock_grade(extraction: list[dict], questions_with_rubrics: list[dict]) -> dict:
    evaluation: dict = {}
    total_marks = 0.0
    max_total = 0.0
    needs_review = False

    # Build a text lookup: question number -> extracted text
    text_by_q: dict[str, str] = {}
    for page in extraction:
        current_q: str | None = None
        for block in page.get("blocks", []):
            if block["type"] == "question_header":
                current_q = block["text"].lstrip("Qq").strip()
            elif current_q and block["type"] in ("theory", "table"):
                text_by_q[current_q] = block.get("text", "")

    for q in questions_with_rubrics:
        qnum: str = q["number"]
        rubric_dict: dict = q.get("rubric") or {}
        criteria: list[dict] = rubric_dict.get("criteria", [])
        extracted_text = text_by_q.get(qnum, "")
        has_answer = len(extracted_text) > 20

        criteria_results = []
        for criterion in criteria:
            max_c = float(criterion["max_marks"])
            # Give a plausible score based on whether we found text
            if has_answer:
                confidence = round(random.uniform(0.65, 0.95), 2)
                awarded = round(max_c * random.uniform(0.6, 1.0), 1)
            else:
                confidence = round(random.uniform(0.4, 0.7), 2)
                awarded = 0.0

            if confidence < 0.6:
                needs_review = True

            criteria_results.append({
                "name": criterion["name"],
                "max": max_c,
                "awarded": awarded,
                "evidence": extracted_text[:120] if extracted_text else "(no answer found)",
                "reason": (
                    f"Student demonstrates {'good' if awarded / max_c >= 0.7 else 'partial'} "
                    f"understanding of {criterion['name'].lower()}."
                ),
                "confidence": confidence,
            })

        q_awarded = sum(c["awarded"] for c in criteria_results)
        q_max = sum(c["max"] for c in criteria_results)
        total_marks += q_awarded
        max_total += q_max

        evaluation[qnum] = {
            "criteria": criteria_results,
            "question_total": round(q_awarded, 1),
            "question_max": q_max,
        }

    return {
        "evaluation": evaluation,
        "total_marks": round(total_marks, 1),
        "max_total": max_total,
        "needs_review": needs_review,
    }
