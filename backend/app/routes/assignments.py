from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File, Form
from app import db
from app.schemas import AssignmentIn, AssignmentOut, QuestionOut, RubricsResponse, RubricOut
from app.services import rubric as rubric_svc
from app.services import pipeline as pipeline_svc

router = APIRouter(prefix="/assignments", tags=["assignments"])

MAX_PDF_BYTES = 10 * 1024 * 1024  # 10 MB


# ── POST /assignments ─────────────────────────────────────────────────────────

@router.post("", status_code=201, response_model=AssignmentOut)
def create_assignment(body: AssignmentIn):
    asgn = db.create_assignment(body.title, body.description)
    try:
        questions = [
            db.add_question(
                assignment_id=asgn["id"],
                number=q.number,
                text=q.text,
                max_marks=q.max_marks,
                answer_key=q.answer_key,
            )
            for q in body.questions
        ]
    except Exception as e:
        db.delete_assignment(asgn["id"])
        raise HTTPException(500, f"Failed to create questions: {str(e)}")

    return AssignmentOut(
        id=asgn["id"],
        title=asgn["title"],
        description=asgn["description"],
        questions=[QuestionOut(**q) for q in questions],
    )


# ── GET /assignments ──────────────────────────────────────────────────────────

@router.get("", response_model=list[AssignmentOut])
def list_assignments():
    assignments = db.list_assignments()
    result = []
    for a in assignments:
        detail = db.get_assignment_with_questions(a["id"])
        result.append(AssignmentOut(
            id=a["id"],
            title=a["title"],
            description=a.get("description"),
            questions=[QuestionOut(**q) for q in detail["questions"]],
        ))
    return result


# ── GET /assignments/{id} ─────────────────────────────────────────────────────

@router.get("/{assignment_id}", response_model=AssignmentOut)
def get_assignment(assignment_id: str):
    try:
        detail = db.get_assignment_with_questions(assignment_id)
    except Exception:
        raise HTTPException(404, f"Assignment {assignment_id} not found.")
    a = detail["assignment"]
    return AssignmentOut(
        id=a["id"],
        title=a["title"],
        description=a.get("description"),
        questions=[QuestionOut(**q) for q in detail["questions"]],
    )


# ── POST /assignments/{id}/rubric/generate ────────────────────────────────────

@router.post("/{assignment_id}/rubric/generate", response_model=RubricsResponse)
def generate_rubrics(assignment_id: str):
    try:
        detail = db.get_assignment_with_questions(assignment_id)
    except Exception:
        raise HTTPException(404, f"Assignment {assignment_id} not found.")

    rubrics = []
    for q in detail["questions"]:
        criteria = rubric_svc.generate_rubric(q)
        db.save_rubric(q["id"], {"criteria": criteria})
        rubrics.append(RubricOut(
            question_id=q["id"],
            number=q["number"],
            criteria=criteria,
        ))

    return RubricsResponse(assignment_id=assignment_id, rubrics=rubrics)


# ── POST /assignments/{id}/submissions ────────────────────────────────────────

@router.post("/{assignment_id}/submissions", status_code=202)
async def upload_submission(
    assignment_id: str,
    background_tasks: BackgroundTasks,
    student_name: str = Form(...),
    file: UploadFile = File(...),
):
    # Validate assignment exists
    try:
        db.get_assignment_with_questions(assignment_id)
    except Exception:
        raise HTTPException(404, f"Assignment {assignment_id} not found.")

    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files are accepted.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_PDF_BYTES:
        raise HTTPException(413, "File exceeds 10 MB limit.")

    # Upload to Supabase storage — we need a submission_id first,
    # so we create a placeholder submission, upload, then update file_path.
    # We use a temp sentinel path to satisfy NOT NULL constraint.
    temp_sub = db.create_submission(
        assignment_id=assignment_id,
        student_name=student_name,
        file_path="pending-upload",
    )
    submission_id = temp_sub["id"]

    file_path = db.upload_pdf(submission_id, file.filename or "submission.pdf", pdf_bytes)

    # Update file_path and keep status 'uploaded'
    db.update_submission_file_path(submission_id, file_path)

    background_tasks.add_task(pipeline_svc.run_pipeline, submission_id)

    return db.get_submission(submission_id)
