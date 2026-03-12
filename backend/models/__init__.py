"""
SQLAlchemy database instance.
Imported by models and app.py to avoid circular imports.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
