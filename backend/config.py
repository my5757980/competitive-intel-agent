from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    bright_data_api_key: str = ""
    bright_data_proxy_url: str = ""
    groq_api_key: str = ""
    openai_api_key: str = ""
    backend_url: str = "http://localhost:8000"

    model_config = SettingsConfigDict(env_file=("../.env", ".env"), env_file_encoding="utf-8", extra="ignore")

    @property
    def llm_provider(self) -> str:
        return "groq" if self.groq_api_key else "openai"

    @property
    def bright_data_configured(self) -> bool:
        return bool(self.bright_data_api_key or self.bright_data_proxy_url)


@lru_cache
def get_settings() -> Settings:
    return Settings()
