"""
Database models for Villa Silvia.

Models:
  - User          : admin users
  - House         : rental houses
  - HouseImage    : photo gallery images linked to a house
  - Availability  : per-day availability and custom pricing
  - BookingRequest: contact / booking form submissions
"""

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from models import db


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # future-proof: sso provider info
    sso_provider = db.Column(db.String(50), nullable=True)   # e.g. "google"
    sso_id = db.Column(db.String(255), nullable=True)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "username": self.username}


# ---------------------------------------------------------------------------
# House
# ---------------------------------------------------------------------------
class House(db.Model):
    __tablename__ = "houses"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    amenities = db.Column(db.Text, nullable=True)   # stored as JSON string
    base_price = db.Column(db.Float, nullable=False, default=0.0)
    cover_image = db.Column(db.String(255), nullable=True)

    # Relationships
    images = db.relationship(
        "HouseImage", backref="house", lazy=True, cascade="all, delete-orphan"
    )
    availability = db.relationship(
        "Availability", backref="house", lazy=True, cascade="all, delete-orphan"
    )
    booking_requests = db.relationship(
        "BookingRequest", backref="house", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self, include_images=True, include_availability=False):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "amenities": self.amenities,
            "base_price": self.base_price,
            "cover_image": self.cover_image,
        }
        if include_images:
            data["images"] = [img.to_dict() for img in self.images]
        if include_availability:
            data["availability"] = [a.to_dict() for a in self.availability]
        return data


# ---------------------------------------------------------------------------
# HouseImage
# ---------------------------------------------------------------------------
class HouseImage(db.Model):
    __tablename__ = "house_images"

    id = db.Column(db.Integer, primary_key=True)
    house_id = db.Column(db.Integer, db.ForeignKey(
        "houses.id"), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    sort_order = db.Column(db.Integer, default=0)  # for reordering

    def to_dict(self):
        return {
            "id": self.id,
            "house_id": self.house_id,
            "image_url": self.image_url,
            "sort_order": self.sort_order,
        }


# ---------------------------------------------------------------------------
# Availability
# ---------------------------------------------------------------------------
class Availability(db.Model):
    __tablename__ = "availability"

    id = db.Column(db.Integer, primary_key=True)
    house_id = db.Column(db.Integer, db.ForeignKey(
        "houses.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    # None → use house base_price
    price = db.Column(db.Float, nullable=True)
    is_available = db.Column(db.Boolean, default=True)

    __table_args__ = (
        db.UniqueConstraint("house_id", "date", name="uq_house_date"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "house_id": self.house_id,
            "date": self.date.isoformat(),
            "price": self.price,
            "is_available": self.is_available,
        }


# ---------------------------------------------------------------------------
# BookingRequest
# ---------------------------------------------------------------------------
class BookingRequest(db.Model):
    __tablename__ = "booking_requests"

    id = db.Column(db.Integer, primary_key=True)
    house_id = db.Column(db.Integer, db.ForeignKey("houses.id"), nullable=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    message = db.Column(db.Text, nullable=True)
    # status: pending | contacted | accepted | rejected
    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        nights = None
        total_price = None
        if self.start_date and self.end_date:
            nights = (self.end_date - self.start_date).days
            if self.house and self.house.base_price:
                total_price = round(nights * float(self.house.base_price), 2)
        return {
            "id": self.id,
            "house_id": self.house_id,
            "house_name": self.house.name if self.house else None,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "nights": nights,
            "total_price": total_price,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }
