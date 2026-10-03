"""
Supabase client singleton + all DB/storage helper functions.
All helpers return plain dicts (or bytes for download_pdf).
"""
from __future__ import annotations

from functools import lru_cache

from supabase import create_client, Client

from app.config import settings

# ---------------------------------------------------------------------------
# Singleton client
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_key)


def _db() -> Client:
    return get_client()


def _bucket() -> str:
    return settings.storage_bucket


# ---------------------------------------------------------------------------
# Assignments
# ---------------------------------------------------------------------------

def create_assignment(title: str, description: str | None = None) -> dict:
    res = _db().table("assignments").insert({
        "title": title,
        "description": description,
    }).execute()
    return res.data[0]


def list_assignments() -> list[dict]:
    res = _db().table("assignments").select("*").order("created_at", desc=True).execute()
    return res.data


def get_assignment_with_questions(assignment_id: str) -> dict:
    a = _db().table("assignments").select("*").eq("id", assignment_id).single().execute()
    q = _db().table("questions").select("*").eq("assignment_id", assignment_id).order("number").execute()
    return {"assignment": a.data, "questions": q.data}


# ---------------------------------------------------------------------------
# Questions
# ---------------------------------------------------------------------------

def add_question(
    assignment_id: str,
    number: str,
    text: str,
    max_marks: int,
    answer_key: str | None = None,
) -> dict:
    res = _db().table("questions").insert({
        "assignment_id": assignment_id,
        "number": number,
        "text": text,
        "max_marks": max_marks,
        "answer_key": answer_key,
    }).execute()
    return res.data[0]


def save_rubric(question_id: str, rubric_json: dict) -> dict:
    res = (
        _db()
        .table("questions")
        .update({"rubric": rubric_json})
        .eq("id", question_id)
        .execute()
    )
    return res.data[0]


# ---------------------------------------------------------------------------
# Submissions
# ---------------------------------------------------------------------------

def create_submission(
    assignment_id: str,
    student_name: str,
    file_path: str,
) -> dict:
    res = _db().table("submissions").insert({
        "assignment_id": assignment_id,
        "student_name": student_name,
        "file_path": file_path,
        "status": "uploaded",
    }).execute()
    return res.data[0]


def update_submission_status(
    submission_id: str,
    status: str,
    error: str | None = None,
) -> dict:
    payload: dict = {"status": status}
    if error is not None:
        payload["error"] = error
    res = (
        _db()
        .table("submissions")
        .update(payload)
        .eq("id", submission_id)
        .execute()
    )
    return res.data[0]


def get_submission(submission_id: str) -> dict:
    res = _db().table("submissions").select("*").eq("id", submission_id).single().execute()
    return res.data


def list_submissions(assignment_id: str | None = None) -> list[dict]:
    q = _db().table("submissions").select("*").order("submitted_at", desc=True)
    if assignment_id:
        q = q.eq("assignment_id", assignment_id)
    return q.execute().data


# ---------------------------------------------------------------------------
# Results
# ---------------------------------------------------------------------------

def save_result(
    submission_id: str,
    extraction: dict,
    evaluation: dict,
    total_marks: float,
    max_total: float,
    needs_review: bool,
) -> dict:
    payload = {
        "submission_id": submission_id,
        "extraction": extraction,
        "evaluation": evaluation,
        "total_marks": total_marks,
        "max_total": max_total,
        "needs_review": needs_review,
    }
    res = (
        _db()
        .table("results")
        .upsert(payload, on_conflict="submission_id")
        .execute()
    )
    return res.data[0]


def get_result(submission_id: str) -> dict:
    res = (
        _db()
        .table("results")
        .select("*")
        .eq("submission_id", submission_id)
        .single()
        .execute()
    )
    return res.data


# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------

def upload_pdf(submission_id: str, filename: str, pdf_bytes: bytes) -> str:
    """Upload pdf_bytes to storage and return the storage file_path."""
    file_path = f"{submission_id}/{filename}"
    _db().storage.from_(_bucket()).upload(
        file_path,
        pdf_bytes,
        {"content-type": "application/pdf"},
    )
    return file_path


def download_pdf(file_path: str) -> bytes:
    """Download and return raw bytes from storage."""
    return _db().storage.from_(_bucket()).download(file_path)
