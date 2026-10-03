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


from app.services.gemma_client import call_gemma_json
import logging
import json

logger = logging.getLogger(__name__)

def grade_answers(extraction: list[dict], questions_with_rubrics: list[dict]) -> dict:
    if not settings.mock_ai:
        return _real_grade(extraction, questions_with_rubrics)
    return _mock_grade(extraction, questions_with_rubrics)

def _render_extraction(extraction: list[dict]) -> str:
    parts = []
    for page in extraction:
        parts.append(f"--- Page {page.get('page', '?')} ---")
        for block in page.get("blocks", []):
            btype = block.get("type", "")
            text = block.get("text", "")
            if btype == "table":
                rows = block.get("rows", [])
                for row in rows:
                    parts.append("| " + " | ".join(row) + " |")
            elif btype == "diagram":
                parts.append(f"[DIAGRAM description: {text}]")
            else:
                parts.append(text)
    return "\n".join(parts)

def _real_grade(extraction: list[dict], questions_with_rubrics: list[dict]) -> dict:
    evaluation: dict = {}
    total_marks = 0.0
    max_total = 0.0
    global_needs_review = False
    
    full_text = _render_extraction(extraction)
    
    sys_prompt = (
        "You are a strict but fair examiner marking handwritten answers that were transcribed by OCR.\n"
        "Score ONLY from what the student wrote.\n"
        "Award partial credit per rubric criterion; never exceed a criterion's max.\n"
        "evidence must be a short verbatim quote from the student's text (empty string if none). Never invent quotes.\n"
        "Accept correct answers worded differently from the answer key.\n"
        "For tables, check cell values against the key. For diagrams, judge only from the description and lower confidence if the description is thin.\n"
        "Text marked [illegible] or [page unreadable] earns no marks for that part; lower confidence and say so in the reason.\n"
        "If no answer for this question is found, set answer_found=false and award 0.\n"
        "confidence is 0 to 1: how sure you are of this criterion's mark given OCR quality and ambiguity.\n"
        "Output ONLY a JSON object:\n"
        "{\"answer_found\": bool, \"student_answer\": \"short transcription of what you graded\", "
        "\"criteria\":[{\"name\":\"\",\"max\":0.0,\"awarded\":0.0,\"reason\":\"\",\"evidence\":\"\",\"confidence\":0.0}], "
        "\"feedback\": \"1 to 2 sentences of constructive feedback addressed to the student\"}"
    )

    for q in questions_with_rubrics:
        qnum = q["number"]
        rubric_dict = q.get("rubric") or {}
        criteria = rubric_dict.get("criteria", [])
        q_max_marks = float(q["max_marks"])
        
        user_prompt = (
            f"Question number: {qnum}\n"
            f"Question text: {q['text']}\n"
            f"Answer key: {q.get('answer_key', '')}\n"
            f"Max marks: {q_max_marks}\n"
            f"Rubric: {json.dumps(criteria)}\n\n"
            f"--- STUDENT SUBMISSION ---\n{full_text}\n"
        )
        
        q_max_total = sum(float(c.get("max_marks", 0.0)) for c in criteria)
        max_total += q_max_total
        
        try:
            res = call_gemma_json(sys_prompt, user_prompt)
            
            answer_found = res.get("answer_found", False)
            student_answer = res.get("student_answer", "")
            res_criteria = res.get("criteria", [])
            feedback = res.get("feedback", "")
            
            q_needs_review = False
            if not answer_found or "[illegible]" in student_answer.lower():
                q_needs_review = True
                
            processed_criteria = []
            q_awarded = 0.0
            
            # Map input criteria to results in case AI misses some
            c_results_by_name = {c.get("name", ""): c for c in res_criteria}
            
            for orig_c in criteria:
                name = orig_c.get("name", "")
                c_max = float(orig_c.get("max_marks", 0.0))
                
                ai_c = c_results_by_name.get(name, {})
                awarded = float(ai_c.get("awarded", 0.0))
                
                # Clamp and round to 0.5
                awarded = max(0.0, min(awarded, c_max))
                awarded = round(awarded * 2) / 2.0
                
                confidence = float(ai_c.get("confidence", 0.5))
                if confidence < 0.6:
                    q_needs_review = True
                    
                processed_criteria.append({
                    "name": name,
                    "max": c_max,
                    "awarded": awarded,
                    "reason": ai_c.get("reason", "No reason provided."),
                    "evidence": ai_c.get("evidence", ""),
                    "confidence": confidence
                })
                
                q_awarded += awarded
                
            if q_needs_review:
                global_needs_review = True
                
            total_marks += q_awarded
            
            evaluation[qnum] = {
                "answer_found": answer_found,
                "student_answer": student_answer,
                "criteria": processed_criteria,
                "feedback": feedback,
                "question_total": q_awarded,
                "question_max": q_max_total,
            }
            
        except Exception as e:
            logger.error(f"Error grading question {qnum}: {e}")
            evaluation[qnum] = {
                "error": str(e),
                "question_max": q_max_total
            }
            global_needs_review = True
            
    return {
        "evaluation": evaluation,
        "total_marks": total_marks,
        "max_total": max_total,
        "needs_review": global_needs_review
    }



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
