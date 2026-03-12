"""
Email service using Resend.
Sends booking confirmation to the guest and a notification to the admin
with one-click Accept / Reject buttons.
"""

import os
import resend
from flask import current_app


def _resend_client():
    api_key = current_app.config.get(
        "RESEND_API_KEY") or os.getenv("RESEND_API_KEY", "")
    resend.api_key = api_key


def _base_url() -> str:
    return os.getenv("BACKEND_BASE_URL", "http://localhost:5001")


# ---------------------------------------------------------------------------
# Guest confirmation email
# ---------------------------------------------------------------------------
def _guest_html(req) -> str:
    dates_line = ""
    if req.start_date and req.end_date:
        dates_line = f"<p><strong>Date:</strong> {req.start_date} → {req.end_date}</p>"
    house_line = f"<p><strong>Casa:</strong> {req.house_name}</p>" if req.house_name else ""

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:36px 40px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-.3px;">
              🌊 Villa Silvia
            </p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.75);">
              Torrette di Fano · Marche · Italia
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">
              Richiesta ricevuta, {req.name.split()[0]}!
            </h2>
            <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
              Abbiamo ricevuto la tua richiesta di prenotazione. Ti risponderemo
              entro <strong>24 ore</strong> all'indirizzo <strong>{req.email}</strong>.
            </p>

            <!-- Summary box -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#94a3b8;
                           letter-spacing:.08em;text-transform:uppercase;">Riepilogo richiesta</p>
                {house_line}
                {dates_line}
                <p><strong>Nome:</strong> {req.name}</p>
                <p style="margin:0"><strong>Email:</strong> {req.email}</p>
                {"<p><strong>Telefono:</strong> " + req.phone + "</p>" if req.phone else ""}
                {"<p><strong>Messaggio:</strong> " + req.message + "</p>" if req.message else ""}
              </td></tr>
            </table>

            <p style="margin:28px 0 0;font-size:14px;color:#64748b;">
              Per qualsiasi domanda rispondi a questa email o scrivici a
              <a href="mailto:perrecae@gmail.com" style="color:#0ea5e9;">perrecae@gmail.com</a>.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              © 2026 Villa Silvia · Torrette di Fano, Marche, Italia
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Admin notification email with Accept / Reject buttons
# ---------------------------------------------------------------------------
def _admin_html(req, accept_url: str, reject_url: str) -> str:
    dates_line = ""
    if req.start_date and req.end_date:
        dates_line = f"<tr><td style='padding:4px 0;color:#64748b;font-size:14px;'><strong>Date:</strong> {req.start_date} → {req.end_date}</td></tr>"
    house_line = f"<tr><td style='padding:4px 0;color:#64748b;font-size:14px;'><strong>Casa:</strong> {req.house_name}</td></tr>" if req.house_name else ""

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e293b,#334155);padding:28px 40px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">
              🏠 Nuova richiesta di prenotazione
            </p>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,.6);">
              Villa Silvia Admin · #{req.id}
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <table cellpadding="0" cellspacing="0">
                  <tr><td style="padding:4px 0;color:#1e293b;font-size:16px;">
                    <strong>{req.name}</strong>
                  </td></tr>
                  <tr><td style="padding:4px 0;color:#64748b;font-size:14px;">
                    <a href="mailto:{req.email}" style="color:#0ea5e9;">{req.email}</a>
                  </td></tr>
                  {"<tr><td style='padding:4px 0;color:#64748b;font-size:14px;'><strong>Tel:</strong> " + req.phone + "</td></tr>" if req.phone else ""}
                  {house_line}
                  {dates_line}
                  {"<tr><td style='padding:8px 0 0;color:#64748b;font-size:14px;'><strong>Messaggio:</strong><br>" + req.message + "</td></tr>" if req.message else ""}
                </table>
              </td></tr>
            </table>

            <!-- CTA buttons -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="48%" align="center">
                  <a href="{accept_url}"
                     style="display:block;background:#16a34a;color:#fff;font-weight:700;
                            font-size:15px;padding:14px 0;border-radius:10px;
                            text-decoration:none;letter-spacing:-.1px;">
                    ✓ Accetta
                  </a>
                </td>
                <td width="4%"></td>
                <td width="48%" align="center">
                  <a href="{reject_url}"
                     style="display:block;background:#dc2626;color:#fff;font-weight:700;
                            font-size:15px;padding:14px 0;border-radius:10px;
                            text-decoration:none;letter-spacing:-.1px;">
                    ✕ Rifiuta
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
              I link funzionano una sola volta e scadono dopo 7 giorni.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              © 2026 Villa Silvia · Dashboard admin:
              <a href="http://localhost:3000/admin/bookings" style="color:#0ea5e9;">
                localhost:3000/admin/bookings
              </a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Status-update confirmation email (after accept/reject via link)
# ---------------------------------------------------------------------------
def _status_html(req, status: str) -> str:
    if status == "accepted":
        color, icon, title, body = (
            "#16a34a", "✓",
            "Prenotazione accettata!",
            "Ottima notizia! La tua richiesta è stata <strong>accettata</strong>. "
            "Ti contatteremo a breve per confermare i dettagli.",
        )
    else:
        color, icon, title, body = (
            "#dc2626", "✕",
            "Richiesta non disponibile",
            "Siamo spiacenti, le date richieste non sono disponibili. "
            "Puoi inviarci una nuova richiesta per date alternative.",
        )
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:{color};padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:48px;">{icon}</p>
            <p style="margin:12px 0 0;font-size:22px;font-weight:700;color:#fff;">{title}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="font-size:15px;color:#64748b;line-height:1.7;">
              Ciao <strong>{req.name.split()[0]}</strong>, {body}
            </p>
            <p style="font-size:13px;color:#94a3b8;margin-top:24px;">
              Per domande: <a href="mailto:perrecae@gmail.com" style="color:#0ea5e9;">perrecae@gmail.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Public send functions
# ---------------------------------------------------------------------------
def send_booking_emails(req, accept_url: str, reject_url: str) -> None:
    """
    Sends:
      1. Confirmation email to the guest
      2. Admin notification with Accept / Reject buttons
    Fails silently (logs error) if Resend is not configured.
    """
    _resend_client()
    from_addr = current_app.config.get(
        "EMAIL_FROM", "Villa Silvia <perrecae@gmail.com>")
    admin_email = current_app.config.get("ADMIN_EMAIL", "perrecae@gmail.com")

    try:
        # 1. Guest confirmation
        resend.Emails.send({
            "from": from_addr,
            "to": [req.email],
            "subject": "Richiesta ricevuta – Villa Silvia",
            "html": _guest_html(req),
        })
    except Exception as exc:
        current_app.logger.error(f"[email] guest confirmation failed: {exc}")

    try:
        # 2. Admin notification
        resend.Emails.send({
            "from": from_addr,
            "to": [admin_email],
            "subject": f"[Villa Silvia] Nuova richiesta da {req.name}",
            "html": _admin_html(req, accept_url, reject_url),
        })
    except Exception as exc:
        current_app.logger.error(f"[email] admin notification failed: {exc}")


def send_status_email(req, status: str) -> None:
    """Sends a status-update email to the guest (accepted / rejected)."""
    _resend_client()
    from_addr = current_app.config.get(
        "EMAIL_FROM", "Villa Silvia <perrecae@gmail.com>")
    subject = (
        "La tua prenotazione è confermata – Villa Silvia"
        if status == "accepted"
        else "Aggiornamento sulla tua richiesta – Villa Silvia"
    )
    try:
        resend.Emails.send({
            "from": from_addr,
            "to": [req.email],
            "subject": subject,
            "html": _status_html(req, status),
        })
    except Exception as exc:
        current_app.logger.error(f"[email] status email failed: {exc}")
