import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models.requests import EnrichRequest
from models.responses import CompanyProfile, ErrorResponse
from agents.lead_enricher import run_lead_enricher

router = APIRouter()


@router.post("/enrich", response_model=CompanyProfile)
async def enrich_company_endpoint(req: EnrichRequest):
    try:
        return await run_lead_enricher(req)
    except httpx.HTTPStatusError as e:
        return JSONResponse(
            status_code=503,
            content=ErrorResponse(
                error="Bright Data Web Scraper API error",
                detail=f"HTTP {e.response.status_code if e.response else 'unknown'}",
                source="bright_data_web_scraper_api",
            ).model_dump(),
        )
    except httpx.RequestError as e:
        return JSONResponse(
            status_code=503,
            content=ErrorResponse(
                error="Network error reaching Bright Data",
                detail=str(e),
                source="bright_data_web_scraper_api",
            ).model_dump(),
        )
