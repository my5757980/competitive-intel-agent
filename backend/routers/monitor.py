import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models.requests import MonitorRequest
from models.responses import CompetitorIntelligence, ErrorResponse
from agents.competitor_monitor import run_competitor_monitor
from tools.sources import BRIGHT_DATA_WEB_UNLOCKER
from tools.web_unlocker import source_of_failure

router = APIRouter()


@router.post("/monitor", response_model=CompetitorIntelligence)
async def monitor_competitor(req: MonitorRequest):
    try:
        result = await run_competitor_monitor(req)
        return result
    except httpx.HTTPStatusError as e:
        source = source_of_failure(e)
        return JSONResponse(
            status_code=503,
            content=ErrorResponse(
                error="Bright Data Web Unlocker error" if source == BRIGHT_DATA_WEB_UNLOCKER else "The site refused the direct fetch",
                detail=f"HTTP {e.response.status_code if e.response else 'unknown'} from {e.request.url.host}",
                source=source,
            ).model_dump(),
        )
    except httpx.RequestError as e:
        source = source_of_failure(e)
        return JSONResponse(
            status_code=503,
            content=ErrorResponse(
                error="Network error reaching Bright Data" if source == BRIGHT_DATA_WEB_UNLOCKER else "Network error reaching the site",
                detail=str(e),
                source=source,
            ).model_dump(),
        )
