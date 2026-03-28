"""
TrendHawk FastAPI Backend — Main entry point v2.1
All API routes for product scraping, search, user management, and admin operations.
"""
import os
import sys
import anyio
from contextlib import asynccontextmanager

if sys.platform == "win32":
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
from fastapi import FastAPI, HTTPException, Depends, Header, Request, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))

from lib.supabase_client import get_admin_client
from lib.plans import get_plan, get_all_plans
from lib.usage import check_credits, deduct_credits, increment_tracked, decrement_tracked, can_track_more
from scrapers.ebay import scrape_ebay_product, search_ebay
from scrapers.etsy import scrape_etsy_listing, search_etsy
from scrapers.cron import refresh_global_cache, create_scheduler

# ── Lifespan: start/stop APScheduler ────────────────────────────────────────

_scheduler = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start the cron scheduler on app startup, shut it down cleanly."""
    # APScheduler has been decoupled into worker.py for horizontal scaling
    yield

# ── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(title="TrendHawk API", version="2.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth Dependency ──────────────────────────────────────────────────────────

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.split(" ")[1]
    try:
        supabase = get_admin_client()
        def _get_user(): return supabase.auth.get_user(token)
        res = await anyio.to_thread.run_sync(_get_user)
        if not res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return res.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth error: {str(e)}")

async def require_admin(user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _is_admin(): return supabase.from_("profiles").select("is_admin").eq("id", user.id).maybe_single().execute()
    profile = await anyio.to_thread.run_sync(_is_admin)
    if not (getattr(profile, "data", None) or {}).get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ── Request Models ────────────────────────────────────────────────────────────

class ScrapeRequest(BaseModel):
    url: str
    platform: Optional[str] = None

class SearchRequest(BaseModel):
    keyword: str
    platform: Optional[str] = "ebay"
    deepScanTop: Optional[int] = 5

class TrackRequest(BaseModel):
    productData: dict

class AlertRequest(BaseModel):
    productId: str
    targetPrice: float
    alertType: Optional[str] = "price_drop"

class PresetRequest(BaseModel):
    name: str
    item_cost: Optional[float] = 0
    shipping_cost: Optional[float] = 0
    ad_spend: Optional[float] = 0
    platform_fee_pct: Optional[float] = 12.75
    other_fees: Optional[float] = 0
    inputs: Optional[list] = []
    results: Optional[dict] = {}
    notes: Optional[str] = None

# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "TrendHawk API", "version": "2.1.0"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

# ── Scrape Single Product ─────────────────────────────────────────────────────

@app.post("/api/scrape")
async def scrape_product(body: ScrapeRequest, user=Depends(get_current_user)):
    url = body.url.strip()
    platform = body.platform

    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    if not platform:
        if "ebay.com" in url or "ebay." in url:
            platform = "ebay"
        elif "etsy.com" in url:
            platform = "etsy"
        else:
            raise HTTPException(status_code=400, detail="Unsupported platform. Use eBay or Etsy URLs.")

    supabase = get_admin_client()
    credit_info = await check_credits(user.id, supabase)
    if not credit_info.get("allowed"):
        raise HTTPException(status_code=403, detail={
            "message": f"Credit limit reached ({credit_info.get('used')}/{credit_info.get('limit')}). Please upgrade.",
            "limitReached": True,
        })

    is_admin = credit_info.get("is_admin", False)
    user_plan = get_plan("admin" if is_admin else credit_info.get("plan", "free"))
    skip_profit = not user_plan["features"].get("profit", False)

    if platform == "ebay":
        result = await scrape_ebay_product(url)
    elif platform == "etsy":
        result = await scrape_etsy_listing(url)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Scraping failed"))

    if not is_admin:
        await deduct_credits(user.id, 1, supabase)

    import datetime as _dt
    product = result.get("product", {})
    analysis = result.get("analysis", {})

    # Compute estimated monthly metrics if not already provided
    monthly_sales_est = product.get("monthlySales") or product.get("est_monthly_sales")
    if not monthly_sales_est:
        sold_qty = product.get("soldQuantity", 0) or 0
        listing_age = product.get("listingAgeDays", 90) or 90
        monthly_sales_est = round(sold_qty / max(listing_age / 30, 1)) if sold_qty else None

    price_val = float(product.get("currentPrice") or product.get("price") or 0)
    monthly_revenue_est = product.get("revenueEst") or product.get("est_monthly_revenue")
    if not monthly_revenue_est and monthly_sales_est and price_val:
        monthly_revenue_est = round(monthly_sales_est * price_val, 2)

    sold_qty_int = int(product.get("soldQuantity", 0) or 0)
    favorites_count = int(product.get("favorites", 0) or 0)
    sell_through = None
    if sold_qty_int and favorites_count:
        sell_through = round((sold_qty_int / (sold_qty_int + favorites_count)) * 100, 1)

    formatted = {
        **product,
        "title": product.get("title") or "Unknown Product",
        "price": price_val,
        "currentPrice": price_val,
        "image": product.get("mainImage") or product.get("image"),
        "mainImage": product.get("mainImage") or product.get("image"),
        "currency": product.get("currency", "USD"),
        "platform": platform,
        "rating": float(product.get("rating") or 0),
        "reviewsCount": int(product.get("reviewsCount") or product.get("reviewCount") or 0),
        "soldQuantity": sold_qty_int,
        "sellerName": product.get("sellerUsername") or product.get("sellerName"),
        "sellerRating": product.get("sellerRating") or product.get("seller_rating"),
        "trendScore": int(product.get("trendScore", 0)),
        "saturationLabel": product.get("saturationLabel", "Trending"),
        "competitionLevel": analysis.get("competitionLevel", product.get("competitionLevel", "N/A")),
        "favorites": favorites_count,
        "inCarts": int(product.get("in_carts") or 0),
        "watchCount": int(product.get("watchCount") or product.get("watch_count") or 0),
        "isBestseller": bool(product.get("is_bestseller", False)),
        # Revenue estimates
        "estMonthlySales": monthly_sales_est,
        "estMonthlyRevenue": monthly_revenue_est,
        "sellThroughPercent": sell_through,
        "listingAgeDays": int(product.get("listingAgeDays", 0) or 0),
        # Timestamps
        "scraped_at": _dt.datetime.utcnow().isoformat() + "Z",
        "scrapedAt": _dt.datetime.utcnow().isoformat() + "Z",
        # Profitability (plan-gated)
        "netProfit": 0 if skip_profit else analysis.get("netProfit", 0),
        "margin": 0 if skip_profit else analysis.get("margin", 0),
        "opportunityScore": 0 if skip_profit else analysis.get("opportunityScore", analysis.get("score", 0)),
        "analysis": {
            **analysis,
            "netProfit": 0 if skip_profit else analysis.get("netProfit", 0),
            "margin": 0 if skip_profit else analysis.get("margin", 0),
            "score": 0 if skip_profit else analysis.get("score", 0),
        },
    }

    return {"success": True, "data": formatted}

# ── Live Search ───────────────────────────────────────────────────────────────

@app.post("/api/search")
async def search_products(body: SearchRequest, user=Depends(get_current_user)):
    keyword = body.keyword.strip()
    platform = (body.platform or "ebay").lower()

    if not keyword:
        raise HTTPException(status_code=400, detail="Keyword is required")

    supabase = get_admin_client()
    credit_info = await check_credits(user.id, supabase)
    if not credit_info.get("allowed"):
        raise HTTPException(status_code=403, detail={"message": "Credit limit reached", "limitReached": True})

    is_admin = credit_info.get("is_admin", False)

    # Check plan gating — free users cannot do live search
    plan_id = "admin" if is_admin else credit_info.get("plan", "free")
    if plan_id == "free":
        raise HTTPException(status_code=403, detail={
            "message": "Live search requires Basic plan or higher.",
            "limitReached": False,
            "requiresUpgrade": True,
        })

    if platform == "etsy":
        result = await search_etsy(keyword, deep_scan_top=body.deepScanTop or 5)
    elif platform == "ebay":
        result = await search_ebay(keyword)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")

    if not is_admin:
        await deduct_credits(user.id, 1, supabase)

    return result

# ── Trending (Global Cache) ───────────────────────────────────────────────────

@app.get("/api/trending")
async def get_trending(platform: str = "all", limit: int = 20, user=Depends(get_current_user)):
    supabase = get_admin_client()

    query = supabase.from_("global_cache_products").select("*").order("trend_score", desc=True).limit(limit)

    if platform != "all":
        query = query.eq("platform", platform)

    try:
        def _get_query(): return query.execute()
        res = await anyio.to_thread.run_sync(_get_query)
        products = res.data or []
    except Exception as e:
        # Handle "PGRST205: Could not find the table public.global_cache_products"
        if "global_cache_products" in str(e):
            return {
                "products": [],
                "platform": platform,
                "cacheEmpty": True,
                "message": "Trending table not found in Supabase. Please run the SQL schema.",
            }
        raise e

    # If cache is empty (first run), return a helpful message
    if not products:
        return {
            "products": [],
            "platform": platform,
            "cacheEmpty": True,
            "message": "Trending cache is being populated. Check back in a few minutes.",
        }

    return {"products": products, "platform": platform, "cacheEmpty": False}

# ── Price History (Pro+ feature) ──────────────────────────────────────────────

@app.get("/api/price-history/{product_id}")
async def get_price_history(product_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()

    # Plan gate: Pro and above
    def _get_usage(): return supabase.from_("user_usage").select("plan").eq("user_id", user.id).maybe_single().execute()
    usage_res = await anyio.to_thread.run_sync(_get_usage)
    plan_id = (getattr(usage_res, "data", None) or {}).get("plan", "free")
    def _get_profile(): return supabase.from_("profiles").select("is_admin").eq("id", user.id).maybe_single().execute()
    profile_res = await anyio.to_thread.run_sync(_get_profile)
    is_admin = (getattr(profile_res, "data", None) or {}).get("is_admin", False)

    if not is_admin and plan_id not in ("pro", "growth"):
        raise HTTPException(status_code=403, detail={
            "message": "Price history requires Pro plan or higher.",
            "requiresUpgrade": True,
            "requiredPlan": "pro",
        })

    def _get_history():
        return (supabase.from_("price_history")
               .select("*")
               .eq("product_id", product_id)
               .eq("user_id", user.id)
               .order("scraped_at", desc=False)
               .execute())
    res = await anyio.to_thread.run_sync(_get_history)

    return {"history": res.data or [], "productId": product_id}

# ── Usage / Credits ───────────────────────────────────────────────────────────

@app.get("/api/usage")
async def get_usage(user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _get_usage(): return supabase.from_("user_usage").select("*").eq("user_id", user.id).maybe_single().execute()
    usage_res = await anyio.to_thread.run_sync(_get_usage)
    def _get_profile(): return supabase.from_("profiles").select("is_admin, full_name, avatar_url").eq("id", user.id).maybe_single().execute()
    profile_res = await anyio.to_thread.run_sync(_get_profile)

    usage = getattr(usage_res, "data", None) or {}
    profile = getattr(profile_res, "data", None) or {}
    is_admin = profile.get("is_admin", False)

    plan_id = "admin" if is_admin else usage.get("plan", "free")
    plan = get_plan(plan_id) if plan_id != "admin" else {"name": "Admin", "limits": {"credits": 999, "trackedProducts": 999}}
    plan_dict = plan if isinstance(plan, dict) else {}
    credit_limit = plan_dict.get("limits", {}).get("credits", 999) if not is_admin else 999

    return {
        "plan": plan_id,
        "used": usage.get("searches_used", 0) if isinstance(usage, dict) else 0,
        "limit": credit_limit,
        "trackedCount": usage.get("tracked_count", 0) if isinstance(usage, dict) else 0,
        "trackedLimit": plan_dict.get("limits", {}).get("trackedProducts", 10),
        "isAdmin": is_admin,
        "resetDate": usage.get("reset_date") if isinstance(usage, dict) else None,
        "profile": profile,
    }

# ── Dashboard Summary (Batched) ──────────────────────────────────────────────

@app.get("/api/dashboard/summary")
async def get_dashboard_summary(user=Depends(get_current_user)):
    """Batched high-performance endpoint with true parallel DB orchestration."""
    try:
        supabase = get_admin_client()
        
        # 1. Define atomic blocking operations
        def _get_usage():   return supabase.from_("user_usage").select("*").eq("user_id", user.id).maybe_single().execute()
        def _get_profile(): return supabase.from_("profiles").select("is_admin, full_name, avatar_url").eq("id", user.id).maybe_single().execute()
        def _get_tracked(): return supabase.from_("tracked_products").select("*").eq("user_id", user.id).order("created_at", desc=True).limit(6).execute()
        def _get_trending():
            try: return supabase.from_("global_cache_products").select("*").order("trend_score", desc=True).limit(3).execute().data or []
            except Exception: return []

        # 2. Synchronous Orchestration via Parallel Threads
        # This eliminates sequential blocking and delivers the data "instantly"
        import asyncio
        usage_res, profile_res, tracked_res, trending_data = await asyncio.gather(
            anyio.to_thread.run_sync(_get_usage),
            anyio.to_thread.run_sync(_get_profile),
            anyio.to_thread.run_sync(_get_tracked),
            anyio.to_thread.run_sync(_get_trending)
        )

        usage = getattr(usage_res, "data", None) or {}
        profile = getattr(profile_res, "data", None) or {}
        is_admin = profile.get("is_admin", False)
        
        plan_id = "admin" if is_admin else usage.get("plan", "free")
        plan = get_plan(plan_id) if plan_id != "admin" else {"name": "Admin", "limits": {"credits": 999, "trackedProducts": 999}}
        
        limits = plan.get("limits", {"credits": 2, "trackedProducts": 10})
        
        usage_data = usage if isinstance(usage, dict) else {}
        usage_summary = {
            "plan": plan_id,
            "used": usage_data.get("searches_used", 0),
            "limit": limits.get("credits", 999),
            "trackedCount": usage_data.get("tracked_count", 0),
            "trackedLimit": limits.get("trackedProducts", 10),
            "isAdmin": is_admin,
            "profile": profile,
        }

        return {
            "usage": usage_summary,
            "tracked": tracked_res.data or [],
            "trending": trending_data,
            "timestamp": os.getpid()
        }
    except Exception as e:
        print(f"[DashboardSummary] ❌ Critical Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Strategic failure in aggregation: {str(e)}")

def raise_e(e): raise e

# ── User Profile ──────────────────────────────────────────────────────────────

@app.get("/api/user")
async def get_user(user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _get_profile(): return supabase.from_("profiles").select("*").eq("id", user.id).maybe_single().execute()
    profile_res = await anyio.to_thread.run_sync(_get_profile)
    return {"user": {"id": user.id, "email": user.email, **(getattr(profile_res, "data", None) or {})}}

@app.patch("/api/user")
async def update_user(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    supabase = get_admin_client()
    allowed = {k: body[k] for k in ["full_name", "avatar_url"] if k in body}
    if allowed:
        def _upsert(): return supabase.from_("profiles").upsert({"id": user.id, **allowed}, on_conflict="id").execute()
        await anyio.to_thread.run_sync(_upsert)
    return {"success": True}

# ── Tracked Products ──────────────────────────────────────────────────────────

@app.get("/api/tracked")
async def get_tracked(user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _get_tracked(): return supabase.from_("tracked_products").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    res = await anyio.to_thread.run_sync(_get_tracked)
    return {"products": res.data or []}

@app.post("/api/tracked")
async def add_tracked(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    supabase = get_admin_client()

    can_track = await can_track_more(user.id, supabase)
    if not can_track["allowed"]:
        raise HTTPException(status_code=403, detail={
            "message": f"Tracking limit reached ({can_track['current']}/{can_track['limit']})",
            "limitReached": True,
        })

    product_data = body.get("productData", body)
    def _insert():
        return supabase.from_("tracked_products").insert({
            "user_id": user.id,
            "title": product_data.get("title"),
            "price": product_data.get("price") or product_data.get("currentPrice"),
            "image": product_data.get("image") or product_data.get("mainImage"),
            "platform": product_data.get("platform"),
            "asin": product_data.get("asin"),
            "url": product_data.get("url"),
            "seller": product_data.get("sellerName") or product_data.get("sellerUsername"),
            "reviews_count": product_data.get("reviewsCount") or product_data.get("reviewCount", 0),
            "rating": product_data.get("rating"),
            "sold_quantity": product_data.get("soldQuantity", 0),
            "trend_score": product_data.get("trendScore", 0),
            "competition_level": product_data.get("competitionLevel"),
            "raw_data": product_data,
        }).execute()
    res = await anyio.to_thread.run_sync(_insert)

    # Record initial price snapshot in price_history
    if res.data:
        tracked_id = res.data[0]["id"]
        price_val = product_data.get("price") or product_data.get("currentPrice")
        if price_val:
            def _insert_hist():
                return supabase.from_("price_history").insert({
                    "product_id": tracked_id,
                    "user_id": user.id,
                    "price": price_val,
                    "stock_level": None,
                    "trend_score": product_data.get("trendScore", 0),
                }).execute()
            await anyio.to_thread.run_sync(_insert_hist)

    await increment_tracked(user.id, supabase)
    return {"success": True, "product": res.data[0] if res.data else None}

@app.delete("/api/tracked/{product_id}")
async def delete_tracked(product_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _delete(): return supabase.from_("tracked_products").delete().eq("id", product_id).eq("user_id", user.id).execute()
    await anyio.to_thread.run_sync(_delete)
    await decrement_tracked(user.id, supabase)
    return {"success": True}

# ── Saved Products (Vault) ────────────────────────────────────────────────────

@app.get("/api/saved")
async def get_saved(user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _get_saved(): return supabase.from_("saved_products").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    res = await anyio.to_thread.run_sync(_get_saved)
    return {"products": res.data or []}

@app.post("/api/saved")
async def add_saved(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    supabase = get_admin_client()

    # Enforce vault limits per tier
    def _get_usage(): return supabase.from_("user_usage").select("plan").eq("user_id", user.id).maybe_single().execute()
    usage_res = await anyio.to_thread.run_sync(_get_usage)
    plan_id = (getattr(usage_res, "data", None) or {}).get("plan", "free")
    def _get_profile(): return supabase.from_("profiles").select("is_admin").eq("id", user.id).maybe_single().execute()
    profile_res = await anyio.to_thread.run_sync(_get_profile)
    is_admin = (getattr(profile_res, "data", None) or {}).get("is_admin", False)

    vault_limits = {"free": 3, "pro": 50, "growth": 1000}
    limit = 9999 if is_admin else vault_limits.get(plan_id, 3)

    def _get_count(): return supabase.from_("saved_products").select("id", count="exact").eq("user_id", user.id).execute()
    count_res = await anyio.to_thread.run_sync(_get_count)
    current_count = count_res.count or 0

    if current_count >= limit:
        raise HTTPException(status_code=403, detail={
            "message": f"Vault limit reached ({current_count}/{limit}). Upgrade to save more products.",
            "limitReached": True,
            "current": current_count,
            "limit": limit,
        })

    def _upsert():
        return supabase.from_("saved_products").upsert({
            "user_id": user.id,
            **body,
        }, on_conflict="user_id,url").execute()
    await anyio.to_thread.run_sync(_upsert)
    return {"success": True}

@app.delete("/api/saved/{product_id}")
async def delete_saved(product_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _delete(): return supabase.from_("saved_products").delete().eq("id", product_id).eq("user_id", user.id).execute()
    await anyio.to_thread.run_sync(_delete)
    return {"success": True}

# ── Calculator Presets (Basic+ feature) ──────────────────────────────────────

@app.get("/api/calculator/presets")
async def get_presets(user=Depends(get_current_user)):
    supabase = get_admin_client()

    def _get_usage(): return supabase.from_("user_usage").select("plan").eq("user_id", user.id).maybe_single().execute()
    usage_res = await anyio.to_thread.run_sync(_get_usage)
    plan_id = (getattr(usage_res, "data", None) or {}).get("plan", "free")
    def _get_profile(): return supabase.from_("profiles").select("is_admin").eq("id", user.id).maybe_single().execute()
    profile_res = await anyio.to_thread.run_sync(_get_profile)
    is_admin = (getattr(profile_res, "data", None) or {}).get("is_admin", False)

    if not is_admin and plan_id == "free":
        raise HTTPException(status_code=403, detail={
            "message": "Calculator presets require Basic plan or higher.",
            "requiresUpgrade": True,
        })

    def _get_presets(): return supabase.from_("calculator_presets").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    res = await anyio.to_thread.run_sync(_get_presets)
    return {"presets": res.data or []}

@app.post("/api/calculator/presets")
async def create_preset(body: PresetRequest, user=Depends(get_current_user)):
    supabase = get_admin_client()

    def _get_usage(): return supabase.from_("user_usage").select("plan").eq("user_id", user.id).maybe_single().execute()
    usage_res = await anyio.to_thread.run_sync(_get_usage)
    plan_id = (getattr(usage_res, "data", None) or {}).get("plan", "free")
    def _get_profile(): return supabase.from_("profiles").select("is_admin").eq("id", user.id).maybe_single().execute()
    profile_res = await anyio.to_thread.run_sync(_get_profile)
    is_admin = (getattr(profile_res, "data", None) or {}).get("is_admin", False)

    if not is_admin and plan_id == "free":
        raise HTTPException(status_code=403, detail={
            "message": "Calculator presets require Basic plan or higher.",
            "requiresUpgrade": True,
        })

    def _insert():
        return supabase.from_("calculator_presets").insert({
            "user_id": user.id,
            "name": body.name,
            "item_cost": body.item_cost,
            "shipping_cost": body.shipping_cost,
            "ad_spend": body.ad_spend,
            "platform_fee_pct": body.platform_fee_pct,
            "other_fees": body.other_fees,
            "inputs": body.inputs,
            "results": body.results,
            "notes": body.notes,
        }).execute()
    res = await anyio.to_thread.run_sync(_insert)

    return {"success": True, "preset": res.data[0] if res.data else None}

@app.delete("/api/calculator/presets/{preset_id}")
async def delete_preset(preset_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _delete(): return supabase.from_("calculator_presets").delete().eq("id", preset_id).eq("user_id", user.id).execute()
    await anyio.to_thread.run_sync(_delete)
    return {"success": True}

# ── Price Alerts ──────────────────────────────────────────────────────────────

@app.get("/api/alerts")
async def get_alerts(user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _get_alerts(): return supabase.from_("price_alerts").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    res = await anyio.to_thread.run_sync(_get_alerts)
    return {"alerts": res.data or []}

@app.post("/api/alerts")
async def create_alert(body: AlertRequest, user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _insert():
        return supabase.from_("price_alerts").insert({
            "user_id": user.id,
            "product_id": body.productId,
            "target_price": body.targetPrice,
            "alert_type": body.alertType,
            "is_active": True,
        }).execute()
    res = await anyio.to_thread.run_sync(_insert)
    return {"success": True, "alert": res.data[0] if res.data else None}

@app.delete("/api/alerts/{alert_id}")
async def delete_alert(alert_id: str, user=Depends(get_current_user)):
    supabase = get_admin_client()
    def _delete(): return supabase.from_("price_alerts").delete().eq("id", alert_id).eq("user_id", user.id).execute()
    await anyio.to_thread.run_sync(_delete)
    return {"success": True}

# ── Plans ─────────────────────────────────────────────────────────────────────

@app.get("/api/plans")
def get_plans():
    return {"plans": get_all_plans()}

# ── Admin Routes ──────────────────────────────────────────────────────────────

@app.get("/api/admin/users")
async def admin_get_users(user=Depends(require_admin)):
    supabase = get_admin_client()
    def _get_profiles(): return supabase.from_("profiles").select("*").execute()
    def _get_usage(): return supabase.from_("user_usage").select("*").execute()
    profiles = await anyio.to_thread.run_sync(_get_profiles)
    usage = await anyio.to_thread.run_sync(_get_usage)
    usage_map = {u["user_id"]: u for u in (usage.data or [])}

    users = []
    for p in (profiles.data or []):
        uid = p["id"]
        u = usage_map.get(uid, {})
        users.append({
            **p,
            "plan": u.get("plan", "free"),
            "searches_used": u.get("searches_used", 0),
            "tracked_count": u.get("tracked_count", 0),
        })

    return {"users": users}

@app.patch("/api/admin/users/{user_id}/plan")
async def admin_update_plan(user_id: str, request: Request, admin=Depends(require_admin)):
    body = await request.json()
    plan = body.get("plan", "free")
    supabase = get_admin_client()
    def _upsert(): return supabase.from_("user_usage").upsert({"user_id": user_id, "plan": plan}, on_conflict="user_id").execute()
    await anyio.to_thread.run_sync(_upsert)
    return {"success": True}

@app.patch("/api/admin/users/{user_id}/credits")
async def admin_update_credits(user_id: str, request: Request, admin=Depends(require_admin)):
    body = await request.json()
    credits = body.get("credits", 0)
    supabase = get_admin_client()
    def _upsert(): return supabase.from_("user_usage").upsert({"user_id": user_id, "searches_used": credits}, on_conflict="user_id").execute()
    await anyio.to_thread.run_sync(_upsert)
    return {"success": True}

@app.patch("/api/admin/users/{user_id}/admin")
async def admin_toggle_admin(user_id: str, request: Request, admin=Depends(require_admin)):
    body = await request.json()
    is_admin = body.get("is_admin", False)
    supabase = get_admin_client()
    def _update(): return supabase.from_("profiles").update({"is_admin": is_admin}).eq("id", user_id).execute()
    await anyio.to_thread.run_sync(_update)
    return {"success": True}

@app.post("/api/admin/cache/refresh")
async def admin_refresh_cache(admin=Depends(require_admin)):
    """Manually trigger the global_cache_products refresh. Returns results."""
    result = await refresh_global_cache()
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Cache refresh failed"))
    return result

@app.get("/api/admin/stats")
async def admin_get_stats(admin=Depends(require_admin)):
    supabase = get_admin_client()

    def _get_usage(): return supabase.from_("user_usage").select("plan").execute()
    usage_res = await anyio.to_thread.run_sync(_get_usage)
    usage_data = usage_res.data or []

    plan_counts = {"free": 0, "basic": 0, "pro": 0, "growth": 0, "admin": 0}
    for row in usage_data:
        plan_id = row.get("plan", "free")
        plan_counts[plan_id] = plan_counts.get(plan_id, 0) + 1

    total_users = len(usage_data)
    paid_users = sum(v for k, v in plan_counts.items() if k not in ("free",))

    # Cache info
    def _get_cache():
        return (supabase.from_("global_cache_products")
                 .select("scraped_at, platform", count="exact")
                 .order("scraped_at", desc=True)
                 .limit(1)
                 .execute())
    cache_res = await anyio.to_thread.run_sync(_get_cache)
    cache_data = (cache_res.data or [{}])[0]
    cache_count = cache_res.count or 0

    return {
        "totalUsers": total_users,
        "paidUsers": paid_users,
        "planBreakdown": plan_counts,
        "cache": {
            "productCount": cache_count,
            "lastRefreshed": cache_data.get("scraped_at"),
        },
    }

# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
