from fastapi import APIRouter, HTTPException
from app import db
from app.schemas import SubmissionOut

router = APIRouter(prefix="/submissions", tags=["submissions"])


# ── GET /submissions?assignment_id= ───────────────────────────────────────────

@router.get("", response_model=list[SubmissionOut])
def list_submissions(assignment_id: str | None = None):
    rows = db.list_submissions(assignment_id)
    return [_enrich(s) for s in rows]


# ── GET /submissions/{id} ─────────────────────────────────────────────────────

@router.get("/{submission_id}", response_model=SubmissionOut)
def get_submission(submission_id: str):
    try:
        sub = db.get_submission(submission_id)
    except Exception:
        raise HTTPException(404, f"Submission {submission_id} not found.")
    return _enrich(sub)


# ── helpers ───────────────────────────────────────────────────────────────────

def _enrich(sub: dict) -> SubmissionOut:
    """Attach result if one exists."""
    result = None
    if sub.get("status") == "graded":
        try:
            result = db.get_result(sub["id"])
        except Exception:
            pass
    return SubmissionOut(**sub, result=result)
