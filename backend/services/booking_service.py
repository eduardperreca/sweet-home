"""
Booking service.
Business logic for creating and updating booking requests.
"""

from datetime import date
from flask import current_app
from models import db
from models.models import BookingRequest, House


def create_booking_request(data: dict) -> BookingRequest:
    """
    Creates and persists a new BookingRequest from form data.
    Raises ValueError if required fields are missing.
    """
    required = ["name", "email"]
    for field in required:
        if not data.get(field):
            raise ValueError(f"Campo obbligatorio mancante: {field}")

    # Parse dates if provided
    start_date = None
    end_date = None
    if data.get("start_date"):
        start_date = date.fromisoformat(data["start_date"])
    if data.get("end_date"):
        end_date = date.fromisoformat(data["end_date"])

    req = BookingRequest(
        house_id=data.get("house_id"),
        name=data["name"],
        email=data["email"],
        phone=data.get("phone"),
        start_date=start_date,
        end_date=end_date,
        message=data.get("message"),
        status="pending",
    )
    db.session.add(req)
    db.session.commit()

    # Send emails (non-blocking – a failure must not abort the booking)
    try:
        from services.email_service import send_booking_emails
        base_url = current_app.config.get(
            "BACKEND_BASE_URL", "http://localhost:5001")
        import itsdangerous
        s = itsdangerous.URLSafeTimedSerializer(
            current_app.config["SECRET_KEY"])
        accept_token = s.dumps({"id": req.id, "action": "accepted"})
        reject_token = s.dumps({"id": req.id, "action": "rejected"})
        accept_url = f"{base_url}/api/booking-request/{req.id}/action?token={accept_token}&action=accepted"
        reject_url = f"{base_url}/api/booking-request/{req.id}/action?token={reject_token}&action=rejected"
        send_booking_emails(req, accept_url, reject_url)
    except Exception as exc:
        current_app.logger.error(f"[booking] email step failed: {exc}")

    return req


VALID_STATUSES = {"pending", "contacted", "accepted", "rejected"}


def update_booking_status(booking_id: int, status: str) -> BookingRequest:
    """Updates the status of an existing booking request."""
    if status not in VALID_STATUSES:
        raise ValueError(f"Status non valido: {status}")

    req = BookingRequest.query.get_or_404(booking_id)
    req.status = status
    db.session.commit()

    # Send status-update email to the guest
    if status in ("accepted", "rejected"):
        try:
            from services.email_service import send_status_email
            send_status_email(req, status)
        except Exception as exc:
            current_app.logger.error(f"[booking] status email failed: {exc}")

    return req
