"""Pipeline: orchestrates OCR → grading → save for a single submission."""
from __future__ import annotations

import asyncio
import traceback

from app import db
from app.config import settings
from app.services import ocr, grader


async def run_pipeline(submission_id: str) -> None:
    try:
        db.update_submission_status(submission_id, "processing")

        # Fetch submission to get file_path and assignment_id
        submission = db.get_submission(submission_id)
        file_path = submission["file_path"]
        assignment_id = submission["assignment_id"]

        # Download PDF from storage
        pdf_bytes = db.download_pdf(file_path)

        # OCR
        extraction = ocr.extract_pages(pdf_bytes)

        # Load questions with their rubrics
        detail = db.get_assignment_with_questions(assignment_id)
        questions = detail["questions"]

        # Grade
        result = grader.grade_answers(extraction, questions)

        # In mock mode: sleep so the 'processing' state is visible in polling
        if settings.mock_ai:
            await asyncio.sleep(3)

        # Persist result
        db.save_result(
            submission_id=submission_id,
            extraction=extraction,
            evaluation=result["evaluation"],
            total_marks=result["total_marks"],
            max_total=result["max_total"],
            needs_review=result["needs_review"],
        )

        db.update_submission_status(submission_id, "graded")

    except Exception as exc:
        error_text = f"{type(exc).__name__}: {exc}"
        db.update_submission_status(submission_id, "failed", error=error_text)
        # Re-raise so FastAPI logs the traceback
        raise
