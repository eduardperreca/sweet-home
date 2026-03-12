"""
Public API routes.
These endpoints are accessible without authentication.
"""

from flask import Blueprint, jsonify, request, current_app
from models.models import House, Availability, BookingRequest
from services.booking_service import create_booking_request

public_bp = Blueprint("public", __name__)


# ---------------------------------------------------------------------------
# Houses
# ---------------------------------------------------------------------------
@public_bp.route("/houses", methods=["GET"])
def get_houses():
    """Returns the list of all houses with their gallery images."""
    houses = House.query.all()
    return jsonify([h.to_dict(include_images=True) for h in houses])


@public_bp.route("/houses/<int:house_id>", methods=["GET"])
def get_house(house_id):
    """Returns a single house with images and availability."""
    house = House.query.get_or_404(house_id)
    return jsonify(house.to_dict(include_images=True, include_availability=True))


@public_bp.route("/houses/<int:house_id>/availability", methods=["GET"])
def get_availability(house_id):
    """
    Returns availability records for a house.
    Accepts optional query params: ?month=YYYY-MM
    """
    House.query.get_or_404(house_id)  # 404 if not found

    month = request.args.get("month")  # e.g. "2025-07"
    query = Availability.query.filter_by(house_id=house_id)

    if month:
        try:
            year, m = month.split("-")
            from sqlalchemy import extract
            query = query.filter(
                extract("year", Availability.date) == int(year),
                extract("month", Availability.date) == int(m),
            )
        except ValueError:
            pass

    records = query.order_by(Availability.date).all()
    return jsonify([r.to_dict() for r in records])


# ---------------------------------------------------------------------------
# Booking request (public form submission)
# ---------------------------------------------------------------------------
@public_bp.route("/booking-request", methods=["POST"])
def submit_booking():
    """Accepts a booking request from the public contact form."""
    data = request.get_json(force=True) or {}
    try:
        req = create_booking_request(data)
        return jsonify(req.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


# ---------------------------------------------------------------------------
# One-click Accept / Reject action (linked from admin email)
# ---------------------------------------------------------------------------
@public_bp.route("/booking-request/<int:booking_id>/action", methods=["GET"])
def booking_action(booking_id):
    """
    Handles the Accept / Reject link clicked directly in the admin email.
    Validates the signed token then updates the booking status.
    Returns a simple HTML confirmation page.
    """
    import itsdangerous
    from services.booking_service import update_booking_status

    token = request.args.get("token", "")
    action = request.args.get("action", "")

    if action not in ("accepted", "rejected"):
        return _action_page("error", "Azione non valida."), 400

    s = itsdangerous.URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        # Token expires after 7 days (604800 seconds)
        payload = s.loads(token, max_age=604800)
    except itsdangerous.SignatureExpired:
        return _action_page("error", "Il link è scaduto (7 giorni)."), 410
    except itsdangerous.BadSignature:
        return _action_page("error", "Link non valido."), 400

    if payload.get("id") != booking_id or payload.get("action") != action:
        return _action_page("error", "Token non corrispondente."), 400

    req = BookingRequest.query.get(booking_id)
    if req is None:
        return _action_page("error", "Richiesta non trovata."), 404

    if req.status in ("accepted", "rejected"):
        label = "accettata" if req.status == "accepted" else "rifiutata"
        return _action_page("info", f"La richiesta di {req.name} è già stata {label}."), 200

    try:
        update_booking_status(booking_id, action)
    except Exception as exc:
        current_app.logger.error(f"[action] status update failed: {exc}")
        return _action_page("error", "Errore interno, riprova."), 500

    verb = "accettata" if action == "accepted" else "rifiutata"
    return _action_page("success", f"Richiesta di {req.name} {verb}! Un'email è stata inviata all'ospite."), 200


def _action_page(kind: str, message: str) -> str:
    color_map = {"success": "#16a34a", "info": "#0ea5e9", "error": "#dc2626"}
    color = color_map.get(kind, "#64748b")
    icon_map = {"success": "✓", "info": "ℹ", "error": "✕"}
    icon = icon_map.get(kind, "•")
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Villa Silvia – Admin</title>
  <style>
    body {{ margin:0; font-family:'Helvetica Neue',Arial,sans-serif;
            background:#f4f7fb; display:flex; align-items:center;
            justify-content:center; min-height:100vh; }}
    .card {{ background:#fff; border-radius:16px; padding:48px 56px;
              text-align:center; box-shadow:0 4px 24px rgba(0,0,0,.1);
              max-width:480px; width:90%; }}
    .icon {{ font-size:56px; color:{color}; margin-bottom:16px; }}
    h2 {{ margin:0 0 12px; color:#1e293b; }}
    p {{ color:#64748b; font-size:15px; line-height:1.6; margin:0; }}
    a {{ display:inline-block; margin-top:28px; padding:12px 28px;
          background:{color}; color:#fff; text-decoration:none;
          border-radius:10px; font-weight:700; font-size:14px; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">{icon}</div>
    <h2>Villa Silvia</h2>
    <p>{message}</p>
    <a href="http://localhost:3000/admin/bookings">Vai all'admin →</a>
  </div>
</body>
</html>"""
