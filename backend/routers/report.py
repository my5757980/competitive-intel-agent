import json
import asyncio
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse, StreamingResponse

from models.requests import ReportRequest
from models.responses import IntelligenceReport, ProgressEvent, ErrorResponse
from agents.crew import run_full_report

router = APIRouter()


@router.post("/report", response_model=IntelligenceReport)
async def generate_report(req: ReportRequest):
    try:
        events = []

        async def collect_progress(event: ProgressEvent) -> None:
            events.append(event)

        report = await run_full_report(req, collect_progress)
        return report
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(error="Report generation failed", detail=str(e)).model_dump(),
        )


@router.get("/report/stream")
async def generate_report_stream(competitor: str = Query(..., min_length=2)):
    req = ReportRequest(competitor=competitor)

    async def event_generator():
        report_holder: list[IntelligenceReport] = []

        async def on_progress(event: ProgressEvent) -> None:
            data = event.model_dump(mode="json")
            yield f"event: progress\ndata: {json.dumps(data)}\n\n"

        async def run_and_collect():
            async def progress_cb(event: ProgressEvent) -> None:
                pass
            report = await run_full_report(req, progress_cb)
            report_holder.append(report)

        progress_queue: asyncio.Queue[ProgressEvent | None] = asyncio.Queue()

        async def progress_cb(event: ProgressEvent) -> None:
            await progress_queue.put(event)

        async def run_task():
            try:
                report = await run_full_report(req, progress_cb)
                report_holder.append(report)
            finally:
                await progress_queue.put(None)

        task = asyncio.create_task(run_task())

        while True:
            event = await progress_queue.get()
            if event is None:
                break
            data = event.model_dump(mode="json")
            yield f"event: progress\ndata: {json.dumps(data)}\n\n"
            await asyncio.sleep(0)

        await task

        if report_holder:
            report_data = report_holder[0].model_dump(mode="json")
            yield f"event: report\ndata: {json.dumps(report_data)}\n\n"
        else:
            yield f"event: error\ndata: {json.dumps({'error': 'Report generation failed'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
