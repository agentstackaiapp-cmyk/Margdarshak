"""
Application Configuration Module
Centralized configuration with validation
"""
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')


class Settings:
    """Application settings — simple attribute-based config (no Pydantic validation at import time)"""

    def __init__(self):
        self.APP_NAME = "Margdarshak"
        self.VERSION = "1.0.0"
        self.ENVIRONMENT = os.environ.get("ENVIRONMENT", "production")
        self.DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

        # Database
        self.MONGO_URL = os.environ.get("MONGO_URL", "")
        self.DB_NAME = os.environ.get("DB_NAME", "test_database")

        # LLM
        self.EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
        self.LLM_MODEL = os.environ.get("LLM_MODEL", "gpt-4o")
        self.LLM_MAX_TOKENS = int(os.environ.get("LLM_MAX_TOKENS", "2000"))
        self.LLM_TEMPERATURE = float(os.environ.get("LLM_TEMPERATURE", "0.7"))

        # Auth
        self.SESSION_EXPIRE_DAYS = int(os.environ.get("SESSION_EXPIRE_DAYS", "7"))
        self.EMERGENT_AUTH_URL = os.environ.get(
            "EMERGENT_AUTH_URL",
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
        )

        # Security
        self.CORS_ORIGINS = ["*"]
        self.MAX_REQUEST_SIZE = int(os.environ.get("MAX_REQUEST_SIZE", str(1024 * 1024)))
        self.RATE_LIMIT_PER_MINUTE = int(os.environ.get("RATE_LIMIT_PER_MINUTE", "60"))

        # Performance
        self.CACHE_TTL_SECONDS = int(os.environ.get("CACHE_TTL_SECONDS", "300"))
        self.DB_MAX_POOL_SIZE = int(os.environ.get("DB_MAX_POOL_SIZE", "10"))
        self.DB_MIN_POOL_SIZE = int(os.environ.get("DB_MIN_POOL_SIZE", "1"))


# Singleton instance
settings = Settings()
