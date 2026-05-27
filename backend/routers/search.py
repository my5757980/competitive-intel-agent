import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models.requests import SearchRequest
from models.responses import SearchResponse, ErrorResponse
from agents.market_researcher import run_market_researcher

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search_market(req: SearchRequest):
    try:
        return await run_market_researcher(req)
    except httpx.HTTPStatusError as e:
        return JSONResponse(
            status_code=503,
            content=ErrorResponse(
                error="Bright Data SERP API error",
                detail=f"HTTP {e.response.status_code if e.response else 'unknown'}",
                source="bright_data_serp_api",
            ).model_dump(),
        )
    except httpx.RequestError as e:
        return JSONResponse(
            status_code=503,
            content=ErrorResponse(
                error="Network error reaching Bright Data",
                detail=str(e),
                source="bright_data_serp_api",
            ).model_dump(),
        )
