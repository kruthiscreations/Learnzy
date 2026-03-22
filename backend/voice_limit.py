"""
voice_limit.py — Daily voice chat limit tracker for SpeakEasy Kids Pro

How it works:
- Each user gets a daily bucket: DAILY_LIMIT_SECONDS seconds per day
- Every voice-chat call logs how many seconds were used
- At midnight IST, the bucket resets automatically
- Changing DAILY_LIMIT_SECONDS here affects ALL users instantly (no app update needed)
- Admin endpoint allows overriding limit per user (e.g. for premium plans)
"""
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
import logging

# ── Configuration — change this one number to update limit for ALL users ──────
DAILY_LIMIT_SECONDS = 10 * 60   # 10 minutes = 600 seconds
UNLIMITED_SECONDS   = 99 * 60   # 99 min flag = "no limit" (for admin/test users)
IST_OFFSET          = timedelta(hours=5, minutes=30)

logger = logging.getLogger(__name__)


def get_ist_today() -> str:
    """Return today's date string in IST timezone (YYYY-MM-DD)."""
    now_ist = datetime.now(timezone.utc) + IST_OFFSET
    return now_ist.strftime("%Y-%m-%d")


async def get_voice_usage(db, user_id: str) -> dict:
    """
    Get today's voice usage for a user.
    Returns dict with: used_seconds, limit_seconds, remaining_seconds,
                       date, is_unlimited, percent_used
    """
    today = get_ist_today()

    # Check if user has a custom limit override
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "voice_limit_override": 1})
    limit = DAILY_LIMIT_SECONDS
    if user and user.get("voice_limit_override") is not None:
        limit = user["voice_limit_override"]  # -1 means unlimited

    is_unlimited = (limit < 0)

    # Fetch today's usage record
    record = await db.voice_usage.find_one({
        "user_id": user_id,
        "date": today
    })

    used = record["used_seconds"] if record else 0
    remaining = max(0, limit - used) if not is_unlimited else UNLIMITED_SECONDS
    percent = min(100, round((used / limit) * 100)) if (not is_unlimited and limit > 0) else 0

    return {
        "user_id":          user_id,
        "date":             today,
        "used_seconds":     used,
        "limit_seconds":    limit if not is_unlimited else -1,
        "remaining_seconds": remaining,
        "is_unlimited":     is_unlimited,
        "percent_used":     percent,
        "used_minutes":     round(used / 60, 1),
        "limit_minutes":    round(limit / 60, 1) if not is_unlimited else -1,
        "remaining_minutes": round(remaining / 60, 1),
        "reset_at_midnight_ist": True,
    }


async def check_voice_allowed(db, user_id: str, requested_seconds: int = 30) -> Tuple[bool, dict]:
    """
    Check if a user is allowed to start a voice session.
    Returns (allowed: bool, usage_info: dict)
    """
    usage = await get_voice_usage(db, user_id)

    if usage["is_unlimited"]:
        return True, usage

    if usage["remaining_seconds"] <= 5:  # less than 5 seconds — block
        return False, usage

    return True, usage


async def record_voice_usage(db, user_id: str, seconds_used: int) -> dict:
    """
    Add seconds_used to today's voice usage for this user.
    Creates the record if it doesn't exist. Returns updated usage.
    """
    today = get_ist_today()
    seconds_used = max(0, int(seconds_used))

    await db.voice_usage.update_one(
        {"user_id": user_id, "date": today},
        {
            "$inc":  {"used_seconds": seconds_used},
            "$setOnInsert": {
                "user_id":    user_id,
                "date":       today,
                "created_at": datetime.utcnow()
            }
        },
        upsert=True
    )

    logger.info(f"Voice usage recorded: user={user_id} +{seconds_used}s date={today}")
    return await get_voice_usage(db, user_id)


async def set_user_voice_limit(db, user_id: str, limit_seconds: int):
    """
    Admin override: set custom voice limit for a specific user.
    Pass -1 for unlimited. Pass 0 to block voice entirely.
    """
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"voice_limit_override": limit_seconds}}
    )
    logger.info(f"Voice limit override set: user={user_id} limit={limit_seconds}s")


def friendly_time(seconds: int) -> str:
    """Convert seconds to human-readable: '9 min 30 sec' or '45 sec'."""
    if seconds <= 0:
        return "0 sec"
    mins = seconds // 60
    secs = seconds % 60
    if mins > 0 and secs > 0:
        return f"{mins} min {secs} sec"
    if mins > 0:
        return f"{mins} min"
    return f"{secs} sec"
