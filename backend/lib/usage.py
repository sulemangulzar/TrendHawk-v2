"""
Usage/credit tracking logic (Python port of lib/usage.js)
"""
from supabase import Client
from lib.plans import get_credit_limit, get_tracked_limit
from datetime import datetime, timezone, timedelta
import anyio


async def check_credits(user_id: str, supabase: Client) -> dict:
    """Check if user has remaining credits. Returns allowed=True/False + metadata."""
    try:
        def _get_usage(): return supabase.from_("user_usage").select("*").eq("user_id", user_id).maybe_single().execute()
        def _get_profile(): return supabase.from_("profiles").select("is_admin").eq("id", user_id).maybe_single().execute()
        usage_res = await anyio.to_thread.run_sync(_get_usage)
        profile_res = await anyio.to_thread.run_sync(_get_profile)
    except Exception as e:
        return {"allowed": False, "error": str(e)}

    usage = getattr(usage_res, "data", None)
    is_admin = (getattr(profile_res, "data", None) or {}).get("is_admin", False)

    current_usage = usage or {
        "user_id": user_id,
        "plan": "free",
        "searches_used": 0,
        "tracked_count": 0,
        "reset_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
    }

    limit = get_credit_limit(current_usage.get("plan", "free"))

    if is_admin:
        return {
            "allowed": True,
            "plan": "admin",
            "used": current_usage.get("searches_used", 0),
            "limit": float("inf"),
            "record": current_usage,
            "is_admin": True,
        }

    if current_usage.get("searches_used", 0) >= limit:
        return {
            "allowed": False,
            "plan": current_usage.get("plan", "free"),
            "used": current_usage.get("searches_used", 0),
            "limit": limit,
        }

    return {
        "allowed": True,
        "plan": current_usage.get("plan", "free"),
        "used": current_usage.get("searches_used", 0),
        "limit": limit,
        "record": current_usage,
    }


async def deduct_credits(user_id: str, amount: int, supabase: Client) -> bool:
    """Deduct credits from user's account."""
    try:
        def _get_res(): return supabase.from_("user_usage").select("searches_used, tracked_count").eq("user_id", user_id).single().execute()
        res = await anyio.to_thread.run_sync(_get_res)
        usage = getattr(res, "data", None) or {}
        current_used = usage.get("searches_used", 0)
        current_tracked = usage.get("tracked_count", 0)

        def _upsert():
            return supabase.from_("user_usage").upsert(
                {"user_id": user_id, "searches_used": current_used + amount, "tracked_count": current_tracked},
                on_conflict="user_id"
            ).execute()
        await anyio.to_thread.run_sync(_upsert)
        return True
    except Exception as e:
        print(f"[Usage] Credit deduction error: {e}")
        return False


async def increment_tracked(user_id: str, supabase: Client) -> bool:
    """Increment tracked product count."""
    try:
        def _get_res(): return supabase.from_("user_usage").select("searches_used, tracked_count").eq("user_id", user_id).single().execute()
        res = await anyio.to_thread.run_sync(_get_res)
        usage = getattr(res, "data", None) or {}
        def _upsert():
            return supabase.from_("user_usage").upsert(
                {"user_id": user_id, "searches_used": usage.get("searches_used", 0), "tracked_count": usage.get("tracked_count", 0) + 1},
                on_conflict="user_id"
            ).execute()
        await anyio.to_thread.run_sync(_upsert)
        return True
    except Exception as e:
        print(f"[Usage] Increment tracked error: {e}")
        return False


async def decrement_tracked(user_id: str, supabase: Client) -> bool:
    """Decrement tracked product count."""
    try:
        def _get_res(): return supabase.from_("user_usage").select("searches_used, tracked_count").eq("user_id", user_id).single().execute()
        res = await anyio.to_thread.run_sync(_get_res)
        usage = getattr(res, "data", None) or {}
        new_tracked = max(0, usage.get("tracked_count", 0) - 1)
        def _upsert():
            return supabase.from_("user_usage").upsert(
                {"user_id": user_id, "searches_used": usage.get("searches_used", 0), "tracked_count": new_tracked},
                on_conflict="user_id"
            ).execute()
        await anyio.to_thread.run_sync(_upsert)
        return True
    except Exception as e:
        print(f"[Usage] Decrement tracked error: {e}")
        return False


async def can_track_more(user_id: str, supabase: Client) -> dict:
    """Check if user can track more products."""
    try:
        def _get_usage(): return supabase.from_("user_usage").select("*").eq("user_id", user_id).maybe_single().execute()
        def _get_profile(): return supabase.from_("profiles").select("is_admin").eq("id", user_id).maybe_single().execute()
        usage_res = await anyio.to_thread.run_sync(_get_usage)
        profile_res = await anyio.to_thread.run_sync(_get_profile)
        usage = getattr(usage_res, "data", None) or {}
        is_admin = (getattr(profile_res, "data", None) or {}).get("is_admin", False)

        tracked_limit = get_tracked_limit(usage.get("plan", "free"))
        current_tracked = usage.get("tracked_count", 0)

        if is_admin:
            return {"allowed": True, "current": current_tracked, "limit": float("inf"), "is_admin": True}

        return {"allowed": current_tracked < tracked_limit, "current": current_tracked, "limit": tracked_limit, "plan": usage.get("plan", "free")}
    except Exception as e:
        return {"allowed": True, "current": 0, "limit": 2}
