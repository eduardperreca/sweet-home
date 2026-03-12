"""
Villa Silvia – Flask Application Entry Point

Initialises the Flask app, registers blueprints and creates the DB tables.
Run with:  flask run   or   python app.py
"""

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db
from models.models import House, HouseImage, Availability, BookingRequest, User  # noqa: F401 – needed for db.create_all()
from routes.public import public_bp
from routes.auth import auth_bp
from routes.admin import admin_bp
from services.auth_service import seed_admin_user


def create_app(config_class=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Allow cross-origin requests from the Next.js dev server
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Extensions
    db.init_app(app)
    JWTManager(app)

    # Register blueprints under /api prefix
    app.register_blueprint(public_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/admin")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Serve uploaded files statically
    upload_folder = app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(
            os.path.join(app.root_path, upload_folder), filename
        )

    # Create DB tables and seed default admin user
    with app.app_context():
        db.create_all()
        seed_admin_user()

    return app


# ---------------------------------------------------------------------------
# Run the development server directly
# ---------------------------------------------------------------------------
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5001)
