# GradeFlow AI — API Contract

> **Status**: Planned — not yet implemented.
> These shapes are the contract between frontend and backend for Commits #3–#4.

---

## Base URL

```
http://localhost:8000
```

---

## Implemented

### `GET /health`

```json
{ "status": "ok", "service": "gradeflow-api" }
```

---

## Planned — Commit #3 (0:20–1:00)

### `POST /assignments`

Create an assignment with questions.

**Request** `application/json`
```json
{
  "title": "Physics Assignment",
  "description": "Wave Motion",
  "questions": [
    {
      "number": "1",
      "text": "What is wavelength?",
      "max_marks": 5,
      "answer_key": "The distance between two consecutive crests or troughs."
    }
  ]
}
```

**Response** `201 Created`
```json
{
  "id": "<uuid>",
  "title": "Physics Assignment",
  "description": "Wave Motion",
  "created_at": "<iso8601>"
}
```

---

### `GET /assignments`

List all assignments.

**Response** `200 OK`
```json
[
  { "id": "<uuid>", "title": "Physics Assignment", "created_at": "<iso8601>" }
]
```

---

### `GET /assignments/{assignment_id}`

Get assignment with questions.

**Response** `200 OK`
```json
{
  "assignment": { "id": "<uuid>", "title": "...", "description": "...", "created_at": "..." },
  "questions": [
    { "id": "<uuid>", "number": "1", "text": "...", "max_marks": 5, "answer_key": "..." }
  ]
}
```

---

### `POST /submissions`

Upload a student PDF for grading.

**Request** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `assignment_id` | string (uuid) | Target assignment |
| `student_name` | string | Student's name |
| `file` | file | PDF file |

**Response** `201 Created`
```json
{
  "id": "<uuid>",
  "status": "uploaded",
  "file_path": "<storage-path>"
}
```

---

### `GET /submissions/{submission_id}`

Poll submission status.

**Response** `200 OK`
```json
{
  "id": "<uuid>",
  "assignment_id": "<uuid>",
  "student_name": "Alice",
  "status": "uploaded | processing | graded | failed",
  "error": null,
  "submitted_at": "<iso8601>"
}
```

---

### `GET /submissions?assignment_id={uuid}`

List submissions, optionally filtered by assignment.

**Response** `200 OK` — array of the shape above.

---

## Planned — Commit #4 (1:00–1:40)

### `GET /results/{submission_id}`

Get grading results for a submission.

**Response** `200 OK`
```json
{
  "submission_id": "<uuid>",
  "total_marks": 8,
  "max_total": 10,
  "needs_review": false,
  "extraction": {
    "1": "The distance between two consecutive crests."
  },
  "evaluation": {
    "1": { "score": 4, "max": 5, "feedback": "Correct but incomplete." }
  }
}
```

---

## Status enum

| Value | Meaning |
|---|---|
| `uploaded` | PDF received, queued |
| `processing` | OCR + grading in progress |
| `graded` | Result available |
| `failed` | Pipeline error — see `error` field |
