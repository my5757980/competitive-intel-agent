from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import os

from routers import monitor, search, enrich, report
from models.responses import ErrorResponse

app = FastAPI(
    title="CompeteIQ GTM Intelligence API",
    description="AI-powered competitive intelligence using Bright Data infrastructure",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("BACKEND_URL", "http://localhost:8000"),
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(monitor.router, tags=["Competitor Monitor"])
app.include_router(search.router, tags=["Market Search"])
app.include_router(enrich.router, tags=["Lead Enrichment"])
app.include_router(report.router, tags=["Intelligence Report"])


@app.get("/health")
async def health_check() -> dict:
    bright_data_key = os.getenv("BRIGHT_DATA_API_KEY", "")
    bright_data_proxy = os.getenv("BRIGHT_DATA_PROXY_URL", "")
    return {
        "status": "ok",
        "bright_data_configured": bool(bright_data_key or bright_data_proxy),
        "llm_provider": "groq" if os.getenv("GROQ_API_KEY") else "openai",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            detail="An unexpected error occurred. Please try again.",
        ).model_dump(),
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            error="Validation error",
            detail=str(exc.errors()),
        ).model_dump(),
    )
