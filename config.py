import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "otazya-secret-key-change-in-production")
    DATABASE_PATH = BASE_DIR / os.environ.get("DATABASE_FILENAME", "reviews.db")
    DEBUG = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
