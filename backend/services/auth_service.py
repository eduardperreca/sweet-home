"""
Authentication service.
Handles user creation, login validation and seeding the default admin user.
"""

from models import db
from models.models import User


def seed_admin_user():
    """
    Creates a default admin user if none exists.
    Credentials: admin / admin123
    Replace these in production or use SSO.
    """
    if not User.query.filter_by(username="admin").first():
        admin = User(username="admin")
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
        print("[seed] Admin user created (admin / admin123)")


def authenticate_user(username: str, password: str):
    """
    Returns the User object if credentials are valid, else None.
    Designed so that future SSO providers can bypass password check.
    """
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        return user
    return None
