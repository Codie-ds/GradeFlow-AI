import os
import json
import asyncio
from app.config import settings

# Force MOCK_AI to false for this test
settings.mock_ai = False

from app.services import rubric as rubric_svc
from app.services import grader as grader_svc

def test_rubric_and_grading():
    # 1. Define mock assignment with 3 questions
    questions = [
        {
            "id": "q1",
            "number": "1",
            "text": "What is the capital of France?",
            "max_marks": 2,
            "answer_key": "Paris",
        },
        {
            "id": "q2",
            "number": "2",
            "text": "State Newton's First Law.",
            "max_marks": 4,
            "answer_key": "An object remains at rest or in uniform motion in a straight line unless acted upon by an external force.",
        },
        {
            "id": "q3",
            "number": "3",
            "text": "Explain photosynthesis.",
            "max_marks": 5,
            "answer_key": "Process by which plants convert light energy to chemical energy.",
        }
    ]

    print("=== 1. Testing Rubric Generation ===")
    for q in questions:
        print(f"\nGenerating rubric for Q{q['number']} ({q['max_marks']} marks)...")
        try:
            criteria = rubric_svc.generate_rubric(q)
            q["rubric"] = {"criteria": criteria}
            print(json.dumps(q["rubric"], indent=2))
        except Exception as e:
            print(f"Failed to generate rubric for Q{q['number']}: {e}")
            q["rubric"] = {"criteria": []}

    print("\n=== 2. Testing Grader ===")
    
    # 2. Hardcoded sample extraction
    # Q1: Correct
    # Q2: Partially correct (missing external force part)
    # Q3: Missing entirely
    extraction = [
        {
            "page": 1,
            "blocks": [
                {
                    "type": "question_header",
                    "text": "Q1"
                },
                {
                    "type": "theory",
                    "text": "The capital of France is Paris."
                },
                {
                    "type": "question_header",
                    "text": "Q2"
                },
                {
                    "type": "theory",
                    "text": "Newton's first law says that things stay still or keep moving straight."
                }
            ]
        }
    ]

    try:
        result = grader_svc.grade_answers(extraction, questions)
        print("\nGrading Result:")
        print(json.dumps(result, indent=2))
        print(f"\nTotals: {result['total_marks']} / {result['max_total']}")
        print(f"Needs Review: {result['needs_review']}")
    except Exception as e:
        print(f"Failed to grade answers: {e}")

if __name__ == "__main__":
    test_rubric_and_grading()
