from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    storage_bucket: str = "submissions"
    mock_ai: bool = True
    qwen_base_url: str = ""
    qwen_api_key: str = ""
    qwen_model: str = ""
    gemma_api_key: str = ""
    gemma_model: str = "gemma-4-31b-it"
    gemma_fallback_model: str | None = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
