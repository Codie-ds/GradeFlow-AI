"""
check_db.py — end-to-end smoke test for the GradeFlow-AI database layer.
Run from backend/: python scripts/check_db.py
"""
import sys
import os

# Ensure app/ is importable when run from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import db

PASS = "\033[32mPASS\033[0m"
FAIL = "\033[31mFAIL\033[0m"

created_ids: dict = {}


def step(label: str, fn):
    try:
        result = fn()
        print(f"  ✓ {label}")
        return result
    except Exception as exc:
        print(f"  ✗ {label}: {exc}")
        raise


def run():
    print("\n── GradeFlow-AI DB smoke test ──\n")

    # 1. Create assignment
    asgn = step("create_assignment", lambda: db.create_assignment(
        title="__test_assignment__",
        description="smoke test",
    ))
    created_ids["assignment_id"] = asgn["id"]

    # 2. Add question
    q = step("add_question", lambda: db.add_question(
        assignment_id=asgn["id"],
        number=1,
        text="What is 2+2?",
        max_marks=5,
        answer_key="4",
    ))
    created_ids["question_id"] = q["id"]

    # 3. Save rubric
    step("save_rubric", lambda: db.save_rubric(
        question_id=q["id"],
        rubric_json={"full": "Correct answer", "partial": "Shows working"},
    ))

    # 4. list_assignments includes our new row
    assignments = step("list_assignments", db.list_assignments)
    ids = [a["id"] for a in assignments]
    assert asgn["id"] in ids, "new assignment not in list"

    # 5. get_assignment_with_questions
    detail = step("get_assignment_with_questions", lambda: db.get_assignment_with_questions(asgn["id"]))
    assert detail["assignment"]["id"] == asgn["id"]
    assert len(detail["questions"]) == 1

    # 6. Create submission
    sub = step("create_submission", lambda: db.create_submission(
        assignment_id=asgn["id"],
        student_name="Test Student",
    ))
    created_ids["submission_id"] = sub["id"]

    # 7. Upload tiny PDF bytes to storage
    tiny_pdf = b"%PDF-1.4 smoke-test"
    file_path = step("upload_pdf", lambda: db.upload_pdf(
        submission_id=sub["id"],
        filename="test.pdf",
        pdf_bytes=tiny_pdf,
    ))
    created_ids["file_path"] = file_path

    # 8. Update submission with file_path
    step("update_submission file_path", lambda: db.update_submission_status(
        submission_id=sub["id"],
        status="processing",
    ))

    # 9. Download and compare
    downloaded = step("download_pdf", lambda: db.download_pdf(file_path))
    assert downloaded == tiny_pdf, (
        f"downloaded bytes differ: got {downloaded!r}, expected {tiny_pdf!r}"
    )

    # 10. Update status to done
    step("update_submission_status done", lambda: db.update_submission_status(
        submission_id=sub["id"],
        status="done",
    ))

    # 11. get_submission
    fetched = step("get_submission", lambda: db.get_submission(sub["id"]))
    assert fetched["status"] == "done"

    # 12. list_submissions
    subs = step("list_submissions (filtered)", lambda: db.list_submissions(asgn["id"]))
    assert any(s["id"] == sub["id"] for s in subs)

    # 13. save_result (upsert)
    result = step("save_result", lambda: db.save_result(
        submission_id=sub["id"],
        extraction={"q1": "4"},
        evaluation={"q1": {"score": 5, "feedback": "Correct"}},
        total_marks=5.0,
        max_total=5.0,
        needs_review=False,
    ))

    # 14. get_result
    fetched_result = step("get_result", lambda: db.get_result(sub["id"]))
    assert fetched_result["total_marks"] == 5.0

    # 15. Upsert again (re-grade simulation)
    step("save_result upsert (re-grade)", lambda: db.save_result(
        submission_id=sub["id"],
        extraction={"q1": "4"},
        evaluation={"q1": {"score": 4, "feedback": "Minor error"}},
        total_marks=4.0,
        max_total=5.0,
        needs_review=True,
    ))

    print("\n── Cleanup ──\n")
    _cleanup()

    print(f"\n{PASS} — all checks passed.\n")


def _cleanup():
    sid = created_ids.get("submission_id")
    aid = created_ids.get("assignment_id")
    fp  = created_ids.get("file_path")

    if fp:
        try:
            db.get_client().storage.from_(db._bucket()).remove([fp])
            print(f"  ✓ storage file deleted: {fp}")
        except Exception as e:
            print(f"  ! storage delete skipped: {e}")

    # Deleting the assignment cascades to questions, submissions, results
    if aid:
        try:
            db.get_client().table("assignments").delete().eq("id", aid).execute()
            print(f"  ✓ assignment (and cascades) deleted")
        except Exception as e:
            print(f"  ! assignment delete failed: {e}")


if __name__ == "__main__":
    try:
        run()
    except Exception as exc:
        print(f"\n{FAIL} — {exc}\n")
        sys.exit(1)
