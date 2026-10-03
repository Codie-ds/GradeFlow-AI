from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
import logging

logger = logging.getLogger("uvicorn.error")

from app.routes.assignments import router as assignments_router
from app.routes.submissions import router as submissions_router

app = FastAPI(title="GradeFlow API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assignments_router, prefix="/api")
app.include_router(submissions_router, prefix="/api")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error: " + str(exc)},
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "gradeflow-api"}

