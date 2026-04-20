import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import smtplib
from datetime import date, datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formataddr, parseaddr
from html import escape, unescape
from typing import Any

import pymysql
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from pymysql.cursors import DictCursor


SESSION_COOKIE = "vision_admin_session"
SESSION_DAYS = 14
PASSWORD_ITERATIONS = 260_000
MAIL_TEMPLATE_KINDS = {"registration", "recovery"}
BRAND_LOGO_URL = "https://visionoftrading.com/mail-avatar-email.png"


app = FastAPI(title="Vision API")


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


def db_config() -> dict[str, Any]:
    return {
        "host": os.getenv("DB_HOST", "127.0.0.1"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "visionoftrad"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "visionoftrad"),
        "charset": "utf8mb4",
        "cursorclass": DictCursor,
        "autocommit": True,
    }


def get_connection():
    return pymysql.connect(**db_config())


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    salt_b64 = base64.urlsafe_b64encode(salt).decode("ascii")
    digest_b64 = base64.urlsafe_b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt_b64}${digest_b64}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt_b64, digest_b64 = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(salt_b64.encode("ascii"))
        expected = base64.urlsafe_b64decode(digest_b64.encode("ascii"))
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def token_hash(token: str) -> str:
    secret = os.getenv("SESSION_SECRET", "")
    if not secret:
        raise RuntimeError("SESSION_SECRET is required")
    return hmac.new(secret.encode("utf-8"), token.encode("utf-8"), hashlib.sha256).hexdigest()


def json_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value]
    if isinstance(value, str):
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(item) for item in parsed]
    return []


def serialize_news(row: dict[str, Any]) -> dict[str, Any]:
    published_at = row.get("published_at")
    if isinstance(published_at, (datetime, date)):
        published_at = published_at.isoformat()

    return {
        "id": row["id"],
        "slug": row["slug"],
        "date": published_at,
        "category": row["category"],
        "isPublished": bool(row["is_published"]),
        "ru": {
            "title": row["ru_title"],
            "excerpt": row["ru_excerpt"],
            "content": json_list(row["ru_content"]),
        },
        "en": {
            "title": row["en_title"],
            "excerpt": row["en_excerpt"],
            "content": json_list(row["en_content"]),
        },
    }


def serialize_admin(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "login": row["login"],
        "role": row["role"],
        "isActive": bool(row["is_active"]),
        "createdAt": row["created_at"].isoformat() if row.get("created_at") else None,
        "lastLoginAt": row["last_login_at"].isoformat() if row.get("last_login_at") else None,
    }


def default_mail_templates() -> dict[str, dict[str, str]]:
    return {
        "registration": {
            "subject": "Vision: регистрация получена",
            "html": f"""
<div style="margin:0;background:#eef7ff;padding:28px;font-family:Arial,sans-serif;color:#102d4d">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #cfe1f1;border-radius:24px;padding:28px">
    <img src="{BRAND_LOGO_URL}" width="72" height="72" alt="Vision" style="display:block;border-radius:50%;margin:0 0 16px;object-fit:cover">
    <p style="margin:0 0 12px;color:#2477c7;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Vision</p>
    <h1 style="margin:0 0 14px;font-size:28px;line-height:1.12;color:#0f2f51">Регистрация получена</h1>
    <p style="margin:0 0 14px;line-height:1.65">Мы получили заявку на регистрацию для <b>{{{{email}}}}</b>.</p>
    <p style="margin:0 0 14px;line-height:1.65">Команда проверит данные и свяжется с вами, если потребуется дополнительная информация.</p>
    <p style="margin:0 0 18px;line-height:1.65;color:#43698f">Промокод: <b>{{{{promo}}}}</b></p>
    <div style="height:1px;background:#d9e8f5;margin:20px 0"></div>
    <p style="margin:0;color:#6383a1;font-size:13px;line-height:1.55">Если вы не отправляли заявку, просто проигнорируйте это письмо.</p>
  </div>
</div>
""".strip(),
            "text": (
                "Здравствуйте!\n\n"
                "Мы получили заявку на регистрацию для {{email}}.\n"
                "Команда проверит данные и свяжется с вами, если потребуется дополнительная информация.\n"
                "Промокод: {{promo}}\n\n"
                "Если вы не отправляли заявку, просто проигнорируйте это письмо."
            ),
        },
        "recovery": {
            "subject": "Vision: восстановление пароля",
            "html": f"""
<div style="margin:0;background:#eef7ff;padding:28px;font-family:Arial,sans-serif;color:#102d4d">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #cfe1f1;border-radius:24px;padding:28px">
    <img src="{BRAND_LOGO_URL}" width="72" height="72" alt="Vision" style="display:block;border-radius:50%;margin:0 0 16px;object-fit:cover">
    <p style="margin:0 0 12px;color:#2477c7;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Vision</p>
    <h1 style="margin:0 0 14px;font-size:28px;line-height:1.12;color:#0f2f51">Восстановление пароля</h1>
    <p style="margin:0 0 14px;line-height:1.65">Мы получили запрос на восстановление пароля для <b>{{{{email}}}}</b>.</p>
    <p style="margin:0 0 14px;line-height:1.65">На этом этапе отправка уже подключена. Следующим шагом мы добавим одноразовую ссылку для смены пароля.</p>
    <div style="height:1px;background:#d9e8f5;margin:20px 0"></div>
    <p style="margin:0;color:#6383a1;font-size:13px;line-height:1.55">Если вы не запрашивали восстановление, просто проигнорируйте это письмо.</p>
  </div>
</div>
""".strip(),
            "text": (
                "Здравствуйте!\n\n"
                "Мы получили запрос на восстановление пароля для {{email}}.\n"
                "На этом этапе отправка уже подключена. Следующим шагом мы добавим одноразовую ссылку для смены пароля.\n\n"
                "Если вы не запрашивали восстановление, просто проигнорируйте это письмо."
            ),
        },
    }


def serialize_mail_template(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "kind": row["kind"],
        "isEnabled": bool(row["is_enabled"]),
        "subject": row["subject"],
        "htmlBody": row["html_body"],
        "textBody": row.get("text_body") or "",
        "updatedAt": row["updated_at"].isoformat() if row.get("updated_at") else None,
    }


def smtp_from_header() -> str:
    value = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", ""))
    name, address = parseaddr(value)
    if name and address:
        return formataddr((name, address))
    return value


def normalize_email(value: str) -> str:
    email = value.strip()
    _, address = parseaddr(email)
    if address != email or "@" not in address or "." not in address.rsplit("@", 1)[-1]:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid email")
    return address


def render_mail_template(value: str, variables: dict[str, str], html: bool = False) -> str:
    rendered = value
    for key, raw_value in variables.items():
        replacement = escape(raw_value) if html else raw_value
        rendered = rendered.replace(f"{{{{{key}}}}}", replacement)
    return rendered


def html_to_text(value: str) -> str:
    without_styles = re.sub(r"<(script|style).*?</\1>", "", value, flags=re.IGNORECASE | re.DOTALL)
    with_breaks = re.sub(r"</(p|div|h[1-6]|li|tr)>", "\n", without_styles, flags=re.IGNORECASE)
    no_tags = re.sub(r"<[^>]+>", "", with_breaks)
    lines = [line.strip() for line in unescape(no_tags).splitlines()]
    return "\n".join(line for line in lines if line)


def get_mail_template(kind: str) -> dict[str, Any]:
    if kind not in MAIL_TEMPLATE_KINDS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mail template not found")

    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM mail_templates WHERE kind = %s", (kind,))
            row = cursor.fetchone()
            if not row:
                seed_mail_templates()
                cursor.execute("SELECT * FROM mail_templates WHERE kind = %s", (kind,))
                row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mail template not found")
            return row


def send_email(to_email: str, subject: str, text: str, html: str | None = None) -> None:
    host = os.getenv("SMTP_HOST")
    username = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    if not host or not username or not password:
        raise RuntimeError("SMTP settings are not configured")

    message = EmailMessage()
    message["From"] = smtp_from_header()
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(text)
    if html:
        message.add_alternative(html, subtype="html")

    port = env_int("SMTP_PORT", 587)
    timeout = env_int("SMTP_TIMEOUT", 20)
    if env_bool("SMTP_USE_SSL", False):
        with smtplib.SMTP_SSL(host, port, timeout=timeout) as smtp:
            smtp.login(username, password)
            smtp.send_message(message)
        return

    with smtplib.SMTP(host, port, timeout=timeout) as smtp:
        smtp.ehlo()
        if env_bool("SMTP_STARTTLS", True):
            smtp.starttls()
            smtp.ehlo()
        smtp.login(username, password)
        smtp.send_message(message)


def log_mail_event(kind: str, email: str, status_value: str, error_message: str | None = None) -> None:
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO mail_events (kind, email, status, error_message)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (kind, email, status_value, error_message),
                )
    except Exception:
        # Mail delivery must not be reported as failed just because audit logging failed.
        pass


def create_tables() -> None:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS admins (
                  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  login VARCHAR(80) NOT NULL UNIQUE,
                  password_hash VARCHAR(255) NOT NULL,
                  role VARCHAR(32) NOT NULL DEFAULT 'owner',
                  is_active TINYINT(1) NOT NULL DEFAULT 1,
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  last_login_at TIMESTAMP NULL DEFAULT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS admin_sessions (
                  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  admin_id BIGINT UNSIGNED NOT NULL,
                  token_hash CHAR(64) NOT NULL UNIQUE,
                  expires_at DATETIME NOT NULL,
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  last_seen_at TIMESTAMP NULL DEFAULT NULL,
                  INDEX idx_admin_sessions_admin_id (admin_id),
                  INDEX idx_admin_sessions_expires_at (expires_at),
                  CONSTRAINT fk_admin_sessions_admin
                    FOREIGN KEY (admin_id) REFERENCES admins(id)
                    ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS news (
                  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  slug VARCHAR(160) NOT NULL UNIQUE,
                  category VARCHAR(60) NOT NULL DEFAULT 'team',
                  published_at DATE NOT NULL,
                  is_published TINYINT(1) NOT NULL DEFAULT 1,
                  ru_title VARCHAR(255) NOT NULL,
                  ru_excerpt TEXT NOT NULL,
                  ru_content JSON NOT NULL,
                  en_title VARCHAR(255) NOT NULL,
                  en_excerpt TEXT NOT NULL,
                  en_content JSON NOT NULL,
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_news_published_at (published_at),
                  INDEX idx_news_is_published (is_published)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS mail_events (
                  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  kind VARCHAR(40) NOT NULL,
                  email VARCHAR(255) NOT NULL,
                  status VARCHAR(30) NOT NULL,
                  error_message TEXT NULL,
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  INDEX idx_mail_events_kind (kind),
                  INDEX idx_mail_events_email (email),
                  INDEX idx_mail_events_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS mail_templates (
                  kind VARCHAR(40) NOT NULL PRIMARY KEY,
                  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
                  subject VARCHAR(255) NOT NULL,
                  html_body MEDIUMTEXT NOT NULL,
                  text_body MEDIUMTEXT NULL,
                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )


def bootstrap_admin() -> None:
    login = os.getenv("ADMIN_BOOTSTRAP_LOGIN")
    password = os.getenv("ADMIN_BOOTSTRAP_PASSWORD")
    if not login or not password:
        return

    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM admins WHERE login = %s", (login,))
            if cursor.fetchone():
                return
            cursor.execute(
                "INSERT INTO admins (login, password_hash, role, is_active) VALUES (%s, %s, 'owner', 1)",
                (login, hash_password(password)),
            )


def seed_mail_templates() -> None:
    templates = default_mail_templates()
    with get_connection() as conn:
        with conn.cursor() as cursor:
            for kind, template in templates.items():
                cursor.execute(
                    """
                    INSERT IGNORE INTO mail_templates (kind, is_enabled, subject, html_body, text_body)
                    VALUES (%s, 1, %s, %s, %s)
                    """,
                    (kind, template["subject"], template["html"], template["text"]),
                )
                cursor.execute(
                    """
                    UPDATE mail_templates
                    SET html_body = REPLACE(html_body, %s, %s)
                    WHERE kind = %s
                      AND html_body LIKE %s
                    """,
                    (
                        "https://visionoftrading.com/mail-avatar.png",
                        BRAND_LOGO_URL,
                        kind,
                        "%https://visionoftrading.com/mail-avatar.png%",
                    ),
                )
                cursor.execute(
                    """
                    UPDATE mail_templates
                    SET html_body = %s
                    WHERE kind = %s
                      AND html_body NOT LIKE %s
                      AND html_body NOT LIKE %s
                      AND html_body LIKE %s
                    """,
                    (
                        template["html"],
                        kind,
                        "%<img %",
                        f"%{BRAND_LOGO_URL}%",
                        '%<p style="margin:0 0 12px;color:#2477c7%',
                    ),
                )


def seed_news_if_empty() -> None:
    default_news = [
        {
            "slug": "risk-management-basics",
            "date": "2026-03-15",
            "category": "education",
            "ru": {
                "title": "Базовый риск-менеджмент: правило 1-2%",
                "excerpt": "Почему ограничение риска на сделку защищает депозит и помогает пережить серию убытков.",
                "content": [
                    "Первое, что мы внедряем в команде - лимит риска на одну сделку. Обычно это 1-2% от рабочего капитала.",
                    "Такой подход позволяет сохранять контроль, даже если рынок идет не по вашему сценарию несколько сделок подряд.",
                    "Перед входом в сделку фиксируйте точку отмены сценария и допустимый убыток. Дисциплина в этом вопросе важнее идеальной точки входа.",
                ],
            },
            "en": {
                "title": "Risk management basics: the 1-2% rule",
                "excerpt": "How position risk limits protect your balance and keep you stable through losing streaks.",
                "content": [
                    "The first habit we build in the team is a strict per-trade risk cap, usually around 1-2% of your working balance.",
                    "This protects your capital when the market does not follow your expected scenario for several trades in a row.",
                    "Define invalidation level and max acceptable loss before entry. In real trading, discipline beats random precision.",
                ],
            },
        },
        {
            "slug": "team-daily-routine",
            "date": "2026-03-12",
            "category": "team",
            "ru": {
                "title": "Ежедневный ритм команды: от разбора до результата",
                "excerpt": "Как устроен типичный торговый день внутри нашей группы и почему это ускоряет прогресс.",
                "content": [
                    "Рабочий день начинается с короткого премаркета: отмечаем ключевые уровни, сценарии и активы в фокусе.",
                    "Далее идут сессии с комментариями наставников, где участники видят не только входы, но и логику управления позицией.",
                    "В конце дня проводим разбор: что сработало, где были ошибки дисциплины и как улучшить исполнение на следующей сессии.",
                ],
            },
            "en": {
                "title": "Team daily routine: from review to execution",
                "excerpt": "How a typical day is structured inside our group and why this format speeds up growth.",
                "content": [
                    "Our day starts with a compact pre-market review: key levels, scenarios, and priority assets for the session.",
                    "During live sessions, mentors explain not only entries but also position management decisions in real time.",
                    "At the end of day we review outcomes: what worked, where discipline slipped, and how to improve next session.",
                ],
            },
        },
        {
            "slug": "entry-checklist-update",
            "date": "2026-03-08",
            "category": "strategy",
            "ru": {
                "title": "Обновление чек-листа входа: меньше импульсивных сделок",
                "excerpt": "Мы добавили новый фильтр волатильности и подтвердили снижение числа эмоциональных входов.",
                "content": [
                    "В новой версии чек-листа перед входом обязательно подтверждаем волатильность и текущую структуру свечей.",
                    "Если рынок дергается без четкой структуры, сделка переносится. Пропуск слабого сигнала - это тоже результат.",
                    "На тестовом периоде обновленный чек-лист показал более стабильную статистику по качеству входов.",
                ],
            },
            "en": {
                "title": "Entry checklist update: fewer impulsive trades",
                "excerpt": "We introduced a volatility filter and confirmed a drop in emotional entries.",
                "content": [
                    "In the updated checklist, volatility and current candle structure must be confirmed before entry.",
                    "If the market is too noisy and structure is unclear, we skip the setup. Skipping weak setups is a win.",
                    "During test weeks, the updated checklist improved consistency and overall entry quality.",
                ],
            },
        },
    ]

    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM news")
            if int(cursor.fetchone()["total"]) > 0:
                return
            for item in default_news:
                cursor.execute(
                    """
                    INSERT INTO news
                      (slug, category, published_at, is_published, ru_title, ru_excerpt, ru_content, en_title, en_excerpt, en_content)
                    VALUES
                      (%s, %s, %s, 1, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        item["slug"],
                        item["category"],
                        item["date"],
                        item["ru"]["title"],
                        item["ru"]["excerpt"],
                        json.dumps(item["ru"]["content"], ensure_ascii=False),
                        item["en"]["title"],
                        item["en"]["excerpt"],
                        json.dumps(item["en"]["content"], ensure_ascii=False),
                    ),
                )


@app.on_event("startup")
def startup() -> None:
    create_tables()
    bootstrap_admin()
    seed_mail_templates()
    seed_news_if_empty()


class LocalizedNews(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    excerpt: str = Field(min_length=2)
    content: list[str] = Field(min_length=1)


class NewsPayload(BaseModel):
    slug: str = Field(min_length=2, max_length=160, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    date: date
    category: str = Field(min_length=2, max_length=60)
    isPublished: bool = True
    ru: LocalizedNews
    en: LocalizedNews


class LoginPayload(BaseModel):
    login: str = Field(min_length=2, max_length=80)
    password: str = Field(min_length=6, max_length=256)


class RegistrationMailPayload(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    promo: str | None = Field(default=None, max_length=120)


class RecoveryMailPayload(BaseModel):
    email: str = Field(min_length=5, max_length=255)


class MailTemplatePayload(BaseModel):
    isEnabled: bool
    subject: str = Field(min_length=2, max_length=255)
    htmlBody: str = Field(min_length=2)
    textBody: str | None = Field(default=None, max_length=20000)


class AdminCreatePayload(BaseModel):
    login: str = Field(min_length=2, max_length=80)
    password: str = Field(min_length=8, max_length=256)
    role: str = Field(default="admin", max_length=32)


class AdminUpdatePayload(BaseModel):
    password: str | None = Field(default=None, min_length=8, max_length=256)
    isActive: bool | None = None
    role: str | None = Field(default=None, max_length=32)


def require_admin(request: Request) -> dict[str, Any]:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Auth required")

    digest = token_hash(token)
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT a.*
                FROM admin_sessions s
                JOIN admins a ON a.id = s.admin_id
                WHERE s.token_hash = %s AND s.expires_at > UTC_TIMESTAMP() AND a.is_active = 1
                """,
                (digest,),
            )
            admin = cursor.fetchone()
            if not admin:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Auth required")
            cursor.execute("UPDATE admin_sessions SET last_seen_at = UTC_TIMESTAMP() WHERE token_hash = %s", (digest,))
            return admin


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/news")
def get_public_news() -> list[dict[str, Any]]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM news
                WHERE is_published = 1
                ORDER BY published_at DESC, id DESC
                """
            )
            return [serialize_news(row) for row in cursor.fetchall()]


@app.post("/api/auth/register-mail")
def send_registration_mail(payload: RegistrationMailPayload) -> dict[str, bool]:
    email = normalize_email(payload.email)
    template = get_mail_template("registration")
    if not bool(template["is_enabled"]):
        log_mail_event("registration", email, "skipped", "Registration email template is disabled")
        return {"ok": True, "sent": False}

    promo = (payload.promo or "").strip()
    variables = {
        "email": email,
        "promo": promo or "не указан",
        "site_url": "https://visionoftrading.com",
    }
    subject = render_mail_template(template["subject"], variables)
    html = render_mail_template(template["html_body"], variables, html=True)
    text_source = template.get("text_body") or html_to_text(template["html_body"])
    text = render_mail_template(text_source, variables)
    try:
        send_email(email, subject, text, html)
    except Exception as exc:
        log_mail_event("registration", email, "failed", str(exc)[:1000])
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Email was not sent") from None
    log_mail_event("registration", email, "sent")
    return {"ok": True, "sent": True}


@app.post("/api/auth/recovery-mail")
def send_recovery_mail(payload: RecoveryMailPayload) -> dict[str, bool]:
    email = normalize_email(payload.email)
    template = get_mail_template("recovery")
    if not bool(template["is_enabled"]):
        log_mail_event("recovery", email, "skipped", "Recovery email template is disabled")
        return {"ok": True, "sent": False}

    variables = {
        "email": email,
        "promo": "",
        "site_url": "https://visionoftrading.com",
    }
    subject = render_mail_template(template["subject"], variables)
    html = render_mail_template(template["html_body"], variables, html=True)
    text_source = template.get("text_body") or html_to_text(template["html_body"])
    text = render_mail_template(text_source, variables)
    try:
        send_email(email, subject, text, html)
    except Exception as exc:
        log_mail_event("recovery", email, "failed", str(exc)[:1000])
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Email was not sent") from None
    log_mail_event("recovery", email, "sent")
    return {"ok": True, "sent": True}


@app.post("/api/admin/login")
def login(payload: LoginPayload, response: Response) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM admins WHERE login = %s AND is_active = 1", (payload.login,))
            admin = cursor.fetchone()
            if not admin or not verify_password(payload.password, admin["password_hash"]):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

            token = secrets.token_urlsafe(32)
            expires_at = now_utc() + timedelta(days=SESSION_DAYS)
            cursor.execute(
                "INSERT INTO admin_sessions (admin_id, token_hash, expires_at) VALUES (%s, %s, %s)",
                (admin["id"], token_hash(token), expires_at.replace(tzinfo=None)),
            )
            cursor.execute("UPDATE admins SET last_login_at = UTC_TIMESTAMP() WHERE id = %s", (admin["id"],))

    response.set_cookie(
        SESSION_COOKIE,
        token,
        httponly=True,
        secure=env_bool("COOKIE_SECURE", True),
        samesite="lax",
        max_age=SESSION_DAYS * 24 * 60 * 60,
        path="/",
    )
    return {"admin": serialize_admin(admin)}


@app.post("/api/admin/logout")
def logout(request: Request, response: Response) -> dict[str, bool]:
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM admin_sessions WHERE token_hash = %s", (token_hash(token),))
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"ok": True}


@app.get("/api/admin/me")
def me(admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    return {"admin": serialize_admin(admin)}


@app.get("/api/admin/mail-templates")
def get_admin_mail_templates(admin: dict[str, Any] = Depends(require_admin)) -> list[dict[str, Any]]:
    del admin
    seed_mail_templates()
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM mail_templates
                ORDER BY FIELD(kind, 'registration', 'recovery'), kind
                """
            )
            return [serialize_mail_template(row) for row in cursor.fetchall()]


@app.put("/api/admin/mail-templates/{kind}")
def update_admin_mail_template(
    kind: str,
    payload: MailTemplatePayload,
    admin: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    del admin
    if kind not in MAIL_TEMPLATE_KINDS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mail template not found")

    text_body = (payload.textBody or "").strip() or None
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO mail_templates (kind, is_enabled, subject, html_body, text_body)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                  is_enabled = VALUES(is_enabled),
                  subject = VALUES(subject),
                  html_body = VALUES(html_body),
                  text_body = VALUES(text_body)
                """,
                (kind, int(payload.isEnabled), payload.subject.strip(), payload.htmlBody, text_body),
            )
            cursor.execute("SELECT * FROM mail_templates WHERE kind = %s", (kind,))
            return serialize_mail_template(cursor.fetchone())


@app.get("/api/admin/news")
def get_admin_news(admin: dict[str, Any] = Depends(require_admin)) -> list[dict[str, Any]]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM news ORDER BY published_at DESC, id DESC")
            return [serialize_news(row) for row in cursor.fetchall()]


@app.post("/api/admin/news", status_code=status.HTTP_201_CREATED)
def create_news(payload: NewsPayload, admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    with get_connection() as conn:
        with conn.cursor() as cursor:
            try:
                cursor.execute(
                    """
                    INSERT INTO news
                      (slug, category, published_at, is_published, ru_title, ru_excerpt, ru_content, en_title, en_excerpt, en_content)
                    VALUES
                      (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        payload.slug,
                        payload.category,
                        payload.date,
                        int(payload.isPublished),
                        payload.ru.title,
                        payload.ru.excerpt,
                        json.dumps(payload.ru.content, ensure_ascii=False),
                        payload.en.title,
                        payload.en.excerpt,
                        json.dumps(payload.en.content, ensure_ascii=False),
                    ),
                )
            except pymysql.err.IntegrityError:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists") from None
            cursor.execute("SELECT * FROM news WHERE id = LAST_INSERT_ID()")
            return serialize_news(cursor.fetchone())


@app.put("/api/admin/news/{news_id}")
def update_news(news_id: int, payload: NewsPayload, admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    with get_connection() as conn:
        with conn.cursor() as cursor:
            try:
                cursor.execute(
                    """
                    UPDATE news
                    SET slug = %s,
                        category = %s,
                        published_at = %s,
                        is_published = %s,
                        ru_title = %s,
                        ru_excerpt = %s,
                        ru_content = %s,
                        en_title = %s,
                        en_excerpt = %s,
                        en_content = %s
                    WHERE id = %s
                    """,
                    (
                        payload.slug,
                        payload.category,
                        payload.date,
                        int(payload.isPublished),
                        payload.ru.title,
                        payload.ru.excerpt,
                        json.dumps(payload.ru.content, ensure_ascii=False),
                        payload.en.title,
                        payload.en.excerpt,
                        json.dumps(payload.en.content, ensure_ascii=False),
                        news_id,
                    ),
                )
            except pymysql.err.IntegrityError:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists") from None
            cursor.execute("SELECT * FROM news WHERE id = %s", (news_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")
            return serialize_news(row)


@app.delete("/api/admin/news/{news_id}")
def delete_news(news_id: int, admin: dict[str, Any] = Depends(require_admin)) -> dict[str, bool]:
    del admin
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM news WHERE id = %s", (news_id,))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")
    return {"ok": True}


@app.get("/api/admin/admins")
def get_admins(admin: dict[str, Any] = Depends(require_admin)) -> list[dict[str, Any]]:
    del admin
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM admins ORDER BY id ASC")
            return [serialize_admin(row) for row in cursor.fetchall()]


@app.post("/api/admin/admins", status_code=status.HTTP_201_CREATED)
def create_admin(payload: AdminCreatePayload, admin: dict[str, Any] = Depends(require_admin)) -> dict[str, Any]:
    del admin
    with get_connection() as conn:
        with conn.cursor() as cursor:
            try:
                cursor.execute(
                    "INSERT INTO admins (login, password_hash, role, is_active) VALUES (%s, %s, %s, 1)",
                    (payload.login, hash_password(payload.password), payload.role),
                )
            except pymysql.err.IntegrityError:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Login already exists") from None
            cursor.execute("SELECT * FROM admins WHERE id = LAST_INSERT_ID()")
            return serialize_admin(cursor.fetchone())


@app.patch("/api/admin/admins/{admin_id}")
def update_admin(
    admin_id: int,
    payload: AdminUpdatePayload,
    current_admin: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    updates: list[str] = []
    values: list[Any] = []

    if payload.password:
        updates.append("password_hash = %s")
        values.append(hash_password(payload.password))
    if payload.isActive is not None:
        if admin_id == current_admin["id"] and payload.isActive is False:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate yourself")
        updates.append("is_active = %s")
        values.append(int(payload.isActive))
    if payload.role:
        updates.append("role = %s")
        values.append(payload.role)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nothing to update")

    values.append(admin_id)
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"UPDATE admins SET {', '.join(updates)} WHERE id = %s", values)
            cursor.execute("SELECT * FROM admins WHERE id = %s", (admin_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
            return serialize_admin(row)
