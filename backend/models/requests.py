from pydantic import BaseModel, field_validator
from typing import Literal


class MonitorRequest(BaseModel):
    target: str
    focus: list[str] = ["pricing", "features", "jobs"]
    country: str = "us"

    @field_validator("target")
    @classmethod
    def target_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("target must not be empty")
        if not v.startswith(("http://", "https://")):
            v = "https://" + v
        return v


class SearchRequest(BaseModel):
    query: str
    num_results: int = 10
    date_filter: Literal["past_week", "past_month"] | None = None

    @field_validator("query")
    @classmethod
    def query_min_length(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError("query must be at least 3 characters")
        return v.strip()

    @field_validator("num_results")
    @classmethod
    def results_range(cls, v: int) -> int:
        return max(1, min(20, v))


class EnrichRequest(BaseModel):
    company: str

    @field_validator("company")
    @classmethod
    def company_min_length(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("company must be at least 2 characters")
        return v.strip()


class ReportRequest(BaseModel):
    competitor: str
    include_sections: list[str] = ["overview", "pricing", "market", "hiring", "recommendations"]

    @field_validator("competitor")
    @classmethod
    def competitor_min_length(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("competitor must be at least 2 characters")
        return v.strip()
