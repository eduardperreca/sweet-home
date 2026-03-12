"""
Admin API routes – all protected by JWT.

Covers:
  - Houses CRUD
  - House images management (upload / delete / reorder)
  - Availability / custom pricing management
  - Booking requests management
"""

import os
import json
from datetime import date
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from models import db
from models.models import House, HouseImage, Availability, BookingRequest
from services.booking_service import update_booking_status

admin_bp = Blueprint("admin", __name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def allowed_file(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in current_app.config["ALLOWED_EXTENSIONS"]


# ---------------------------------------------------------------------------
# Houses
# ---------------------------------------------------------------------------
@admin_bp.route("/houses", methods=["GET"])
@jwt_required()
def list_houses():
    houses = House.query.all()
    return jsonify([h.to_dict(include_images=True) for h in houses])


@admin_bp.route("/houses", methods=["POST"])
@jwt_required()
def create_house():
    data = request.get_json(force=True) or {}
    if not data.get("name"):
        return jsonify({"error": "Il nome della casa è obbligatorio"}), 400

    house = House(
        name=data["name"],
        description=data.get("description"),
        amenities=json.dumps(data.get("amenities", [])),
        base_price=float(data.get("base_price", 0)),
        cover_image=data.get("cover_image"),
    )
    db.session.add(house)
    db.session.commit()
    return jsonify(house.to_dict()), 201


@admin_bp.route("/houses/<int:house_id>", methods=["GET"])
@jwt_required()
def get_house(house_id):
    house = House.query.get_or_404(house_id)
    return jsonify(house.to_dict(include_images=True, include_availability=True))


@admin_bp.route("/houses/<int:house_id>", methods=["PUT"])
@jwt_required()
def update_house(house_id):
    house = House.query.get_or_404(house_id)
    data = request.get_json(force=True) or {}

    house.name = data.get("name", house.name)
    house.description = data.get("description", house.description)
    if "amenities" in data:
        house.amenities = json.dumps(data["amenities"])
    if "base_price" in data:
        house.base_price = float(data["base_price"])
    house.cover_image = data.get("cover_image", house.cover_image)

    db.session.commit()
    return jsonify(house.to_dict())


@admin_bp.route("/houses/<int:house_id>", methods=["DELETE"])
@jwt_required()
def delete_house(house_id):
    house = House.query.get_or_404(house_id)
    db.session.delete(house)
    db.session.commit()
    return jsonify({"message": "Casa eliminata"}), 200


# ---------------------------------------------------------------------------
# House Images
# ---------------------------------------------------------------------------
@admin_bp.route("/houses/<int:house_id>/images", methods=["POST"])
@jwt_required()
def upload_image(house_id):
    """Upload one image file for a house."""
    House.query.get_or_404(house_id)

    if "file" not in request.files:
        return jsonify({"error": "Nessun file caricato"}), 400

    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Tipo di file non consentito"}), 400

    filename = secure_filename(file.filename)
    upload_dir = os.path.join(
        current_app.config["UPLOAD_FOLDER"], str(house_id))
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)

    # Store relative URL
    image_url = f"/uploads/{house_id}/{filename}"
    img = HouseImage(house_id=house_id, image_url=image_url)
    db.session.add(img)
    db.session.commit()
    return jsonify(img.to_dict()), 201


@admin_bp.route("/images/<int:image_id>", methods=["DELETE"])
@jwt_required()
def delete_image(image_id):
    img = HouseImage.query.get_or_404(image_id)
    # Remove file from disk
    file_path = os.path.join(
        current_app.root_path, img.image_url.lstrip("/")
    )
    if os.path.exists(file_path):
        os.remove(file_path)
    db.session.delete(img)
    db.session.commit()
    return jsonify({"message": "Immagine eliminata"})


@admin_bp.route("/images/reorder", methods=["PUT"])
@jwt_required()
def reorder_images():
    """
    Expects JSON: [{"id": 1, "sort_order": 0}, ...]
    """
    data = request.get_json(force=True) or []
    for item in data:
        img = HouseImage.query.get(item["id"])
        if img:
            img.sort_order = item["sort_order"]
    db.session.commit()
    return jsonify({"message": "Ordine aggiornato"})


@admin_bp.route("/upload-temp", methods=["POST"])
@jwt_required()
def upload_temp():
    """Upload a temporary cover image (no house_id needed). Returns its public URL."""
    if "file" not in request.files:
        return jsonify({"error": "Nessun file caricato"}), 400

    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Tipo di file non consentito"}), 400

    filename = secure_filename(file.filename)
    upload_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], "temp")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)

    return jsonify({"url": f"/uploads/temp/{filename}"}), 201


# ---------------------------------------------------------------------------
# Availability & Pricing
# ---------------------------------------------------------------------------
@admin_bp.route("/houses/<int:house_id>/availability", methods=["GET"])
@jwt_required()
def get_availability(house_id):
    House.query.get_or_404(house_id)
    records = (
        Availability.query.filter_by(house_id=house_id)
        .order_by(Availability.date)
        .all()
    )
    return jsonify([r.to_dict() for r in records])


@admin_bp.route("/houses/<int:house_id>/availability", methods=["POST"])
@jwt_required()
def set_availability(house_id):
    """
    Upsert one or more availability records.
    Expects JSON: [{ "date": "YYYY-MM-DD", "price": 120, "is_available": true }, ...]
    """
    House.query.get_or_404(house_id)
    payload = request.get_json(force=True) or []
    if isinstance(payload, dict):
        payload = [payload]

    results = []
    for item in payload:
        d = date.fromisoformat(item["date"])
        record = Availability.query.filter_by(
            house_id=house_id, date=d).first()
        if record:
            record.price = item.get("price", record.price)
            record.is_available = item.get("is_available", record.is_available)
        else:
            record = Availability(
                house_id=house_id,
                date=d,
                price=item.get("price"),
                is_available=item.get("is_available", True),
            )
            db.session.add(record)
        results.append(record)

    db.session.commit()
    return jsonify([r.to_dict() for r in results]), 200


@admin_bp.route("/availability/<int:avail_id>", methods=["DELETE"])
@jwt_required()
def delete_availability(avail_id):
    record = Availability.query.get_or_404(avail_id)
    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Record eliminato"})


# ---------------------------------------------------------------------------
# Booking Requests
# ---------------------------------------------------------------------------
@admin_bp.route("/booking-requests", methods=["GET"])
@jwt_required()
def list_bookings():
    """Returns all booking requests, newest first."""
    status_filter = request.args.get("status")
    query = BookingRequest.query.order_by(BookingRequest.created_at.desc())
    if status_filter:
        query = query.filter_by(status=status_filter)
    return jsonify([r.to_dict() for r in query.all()])


@admin_bp.route("/booking-requests/<int:booking_id>", methods=["DELETE"])
@jwt_required()
def delete_booking(booking_id):
    req = BookingRequest.query.get_or_404(booking_id)
    db.session.delete(req)
    db.session.commit()
    return jsonify({"message": "Richiesta eliminata"})


@admin_bp.route("/booking-requests/<int:booking_id>/status", methods=["PUT"])
@jwt_required()
def update_status(booking_id):
    """
    Expects JSON: { "status": "contacted" | "accepted" | "rejected" }
    """
    data = request.get_json(force=True) or {}
    try:
        req = update_booking_status(booking_id, data.get("status", ""))
        return jsonify(req.to_dict())
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
