"""
Authentication route.
POST /auth/login  → returns a JWT access token.

Structured to support SSO in the future (Google OAuth, etc.).
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from services.auth_service import authenticate_user

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Expects JSON: { "username": "...", "password": "..." }
    Returns:      { "token": "<jwt>" }
    """
    data = request.get_json(force=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username e password obbligatori"}), 400

    user = authenticate_user(username, password)
    if not user:
        return jsonify({"error": "Credenziali non valide"}), 401

    # Create a JWT token with the user id as identity
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()})
