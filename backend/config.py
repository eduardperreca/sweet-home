"""
Application configuration.
Reads values from the .env file (via python-dotenv).
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Flask secret key – change this in production
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # Database – defaults to a local SQLite file
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "sqlite:///villa_silvia.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File uploads
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))

    # Allowed image extensions
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

    # Email (Resend)
    RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "perrecae@gmail.com")
    EMAIL_FROM = os.getenv("EMAIL_FROM", "Villa Silvia <perrecae@gmail.com>")

    # Base URL used to build action links inside admin emails
    BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:5001")
