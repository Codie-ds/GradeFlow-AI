"""OCR service — extract pages from a PDF.

Returns: list of page dicts
  {"page": int, "blocks": [{"type": str, "text": str, "rows": [[...]]}]}

In mock mode returns realistic sample data so the pipeline can be tested
end-to-end without Qwen credentials.
"""
from __future__ import annotations

from app.config import settings


def extract_pages(pdf_bytes: bytes) -> list[dict]:
    if not settings.mock_ai:
        raise NotImplementedError("Real OCR (Qwen) not yet integrated.")
    return _mock_pages()


def _mock_pages() -> list[dict]:
    return [
        {
            "page": 1,
            "blocks": [
                {
                    "type": "question_header",
                    "text": "Q1",
                    "rows": [],
                },
                {
                    "type": "theory",
                    "text": (
                        "Wavelength is the distance between two consecutive points "
                        "that are in phase, such as crest to crest or trough to trough. "
                        "It is denoted by the Greek letter lambda (λ) and measured in metres."
                    ),
                    "rows": [],
                },
            ],
        },
        {
            "page": 2,
            "blocks": [
                {
                    "type": "question_header",
                    "text": "Q2",
                    "rows": [],
                },
                {
                    "type": "theory",
                    "text": (
                        "Newton's second law states that the net force acting on an object "
                        "equals its mass multiplied by its acceleration (F = ma). "
                        "The direction of acceleration is the same as the net force."
                    ),
                    "rows": [],
                },
                {
                    "type": "table",
                    "text": "",
                    "rows": [
                        ["Force (N)", "Mass (kg)", "Acceleration (m/s²)"],
                        ["10", "2", "5"],
                        ["20", "4", "5"],
                    ],
                },
            ],
        },
    ]
