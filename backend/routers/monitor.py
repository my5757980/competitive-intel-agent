import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models.requests import MonitorRequest
from models.responses import CompetitorIntelligence, ErrorResponse
from agents.competitor_monitor import run_competitor_monitor

router = APIRouter()


@router.post("/monitor", response_model=CompetitorIntelligence)
async def monitor_competitor(req: MonitorRequest):
    try:
        result = await run_competitor_monitor(req)
        return result
    except httpx.HTTPStatusError as e:
        return JSONResponse(
            status_code=503,
            content=ErrorResponse(
                error="Bright Data Web Unlocker error",
                detail=f"HTTP {e.response.status_code if e.response else 'unknown'}",
                source="bright_data_web_unlocker",
            ).model_dump(),
        )
    except httpx.RequestError as e:
        return JSONResponse(
            status_code=503,
            content=ErrorResponse(
                error="Network error reaching Bright Data",
                detail=str(e),
                source="bright_data_web_unlocker",
            ).model_dump(),
        )
