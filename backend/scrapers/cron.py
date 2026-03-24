"""
TrendHawk — Global Cache Cron Job
Scrapes the top ~50 trending products across eBay and Etsy every 24 hours.
Results are saved to the `global_cache_products` Supabase table.
Free-tier users read ONLY from this table (zero live proxy cost).

Targets:
  Etsy  — 6 category URLs sorted by top reviews/bestsellers
  eBay  — 6 popular niche search terms with sold-items filtering

Integration:
  - APScheduler (AsyncIOScheduler) runs refresh_global_cache() every 24h
  - FastAPI lifespan starts/stops the scheduler
  - Admin endpoint POST /api/admin/cache/refresh triggers it manually
"""
import asyncio
import re
from datetime import date

import httpx
from bs4 import BeautifulSoup

from lib.trend_score import calculate_trend_score, get_saturation_label

# ── Category / Niche Targets ──────────────────────────────────

ETSY_CATEGORY_URLS = [
    "https://www.etsy.com/c/home-and-living?order=most_relevant&ref=catnav-10923",
    "https://www.etsy.com/c/jewelry?order=most_relevant&ref=catnav-10905",
    "https://www.etsy.com/c/clothing?order=most_relevant&ref=catnav-10922",
    "https://www.etsy.com/c/art-and-collectibles?order=most_relevant",
    "https://www.etsy.com/c/bath-and-beauty?order=most_relevant",
    "https://www.etsy.com/c/toys-and-games?order=most_relevant",
]

EBAY_TRENDING_SEARCHES = [
    "phone accessories",
    "home decor",
    "fitness equipment",
    "gaming accessories",
    "pet supplies",
    "kitchen gadgets",
]

# Items scraped per category / keyword
ITEMS_PER_SOURCE = 8


# ── Stealth Headers ───────────────────────────────────────────

def _headers(ua: str = None) -> dict:
    import random
    _UAS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    ]
    try:
        from fake_useragent import UserAgent
        ua = ua or UserAgent().chrome
    except Exception:
        ua = ua or random.choice(_UAS)

    return {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Referer": "https://www.google.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Upgrade-Insecure-Requests": "1",
    }


async def _safe_get(url: str, timeout: int = 25) -> str | None:
    """Lightweight fetch with proxy → direct fallback."""
    from lib.proxy import get_proxy_dict
    proxies = get_proxy_dict()
    h = _headers()

    if proxies:
        try:
            async with httpx.AsyncClient(proxies=proxies, timeout=timeout, headers=h, follow_redirects=True) as c:
                r = await c.get(url)
                if r.status_code == 200 and len(r.text) > 4000:
                    return r.text
        except Exception as e:
            print(f"[Cron] Proxy fetch failed: {e}")

    try:
        async with httpx.AsyncClient(timeout=timeout, headers=h, follow_redirects=True) as c:
            r = await c.get(url)
            if r.status_code == 200 and len(r.text) > 4000:
                return r.text
    except Exception as e:
        print(f"[Cron] Direct fetch failed: {e}")

    return None


# ── Parse Helpers ─────────────────────────────────────────────

def _parse_int(text: str) -> int:
    """Extract first integer from a string like 'In 27 people's carts'."""
    m = re.search(r"[\d,]+", str(text).replace(",", ""))
    return int(m.group().replace(",", "")) if m else 0


def _parse_price(text: str) -> float:
    m = re.search(r"[\d,]+\.?\d*", str(text).replace(",", ""))
    if m:
        try:
            p = float(m.group().replace(",", ""))
            return round(p, 2) if 0 < p < 100_000 else 0
        except ValueError:
            pass
    return 0


# ── Etsy Category Scraper ─────────────────────────────────────

async def _scrape_etsy_category(url: str) -> list[dict]:
    """Scrape trending products from an Etsy category page."""
    print(f"[Cron] Etsy → {url[:70]}")
    html = await _safe_get(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    results = []

    for item in soup.select("[data-listing-id]")[:ITEMS_PER_SOURCE]:
        listing_id = item.get("data-listing-id", "")
        a = item.select_one('a[href*="/listing/"]')
        if not a:
            continue
        href = a.get("href", "")
        product_url = href.split("?")[0] if href.startswith("http") else f"https://www.etsy.com{href.split('?')[0]}"

        title_el = item.select_one("h3") or item.select_one('[class*="title"]')
        title = title_el.get_text(strip=True) if title_el else ""
        if not title:
            continue

        price_el = item.select_one(".currency-value") or item.select_one('[class*="price"]')
        price = _parse_price(price_el.get_text()) if price_el else 0

        img_el = item.select_one("img")
        image = (img_el.get("src") or img_el.get("data-src")) if img_el else None

        # ── Demand signals ────────────────────────────────────
        item_text = item.get_text(" ", strip=True)

        # "In X people's carts"
        cart_match = re.search(r"[Ii]n (\d+) (?:people|person)'?s? cart", item_text)
        in_carts = int(cart_match.group(1)) if cart_match else 0

        is_bestseller = bool(
            item.select_one('[class*="bestseller"]') or
            re.search(r"\bBestseller\b", item_text, re.IGNORECASE)
        )

        # Review count
        review_el = item.select_one('[class*="review"]') or item.select_one('[class*="rating"]')
        review_text = review_el.get_text() if review_el else ""
        review_count = _parse_int(review_text)

        trend_score = calculate_trend_score(
            sales_velocity=0,
            cart_adds=in_carts,
            review_count=review_count,
            is_bestseller=is_bestseller,
        )
        saturation = get_saturation_label(review_count, trend_score)

        results.append({
            "platform": "etsy",
            "title": title,
            "image_url": image,
            "price": price,
            "currency": "USD",
            "product_url": product_url,
            "trend_score": trend_score,
            "in_carts": in_carts,
            "sold_last_24h": 0,
            "watch_count": 0,
            "is_bestseller": is_bestseller,
            "almost_gone": False,
            "saturation_label": saturation,
            "review_count": review_count,
            "rating": None,
            "cache_date": str(date.today()),
        })

    print(f"[Cron] Etsy found {len(results)} products from {url[:50]}")
    return results


# ── eBay Trending Scraper ─────────────────────────────────────

async def _scrape_ebay_trending(keyword: str) -> list[dict]:
    """
    Scrape eBay sold listings for a keyword to find high-velocity items.
    Uses LH_Sold=1&LH_Complete=1 to target completed/sold listings.
    """
    url = (
        f"https://www.ebay.com/sch/i.html?_nkw={keyword.replace(' ', '+')}"
        f"&LH_Sold=1&LH_Complete=1&_sop=12"  # sop=12 = sort by most recent
    )
    print(f"[Cron] eBay → {keyword}")
    html = await _safe_get(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "lxml")
    results = []

    for item in soup.select(".s-item")[:ITEMS_PER_SOURCE + 2]:
        title_el = item.select_one(".s-item__title")
        title = title_el.get_text(strip=True) if title_el else ""
        if not title or title.lower().startswith("shop on ebay"):
            continue

        a = item.select_one("a.s-item__link")
        product_url = a.get("href", "").split("?")[0] if a else ""

        price_el = item.select_one(".s-item__price")
        price = _parse_price(price_el.get_text()) if price_el else 0

        img_el = item.select_one("img")
        image = img_el.get("src") if img_el else None

        item_text = item.get_text(" ", strip=True)

        # "X+ sold in last 24 hours"
        sold_match = re.search(r"(\d+)\+?\s*sold in last 24", item_text, re.IGNORECASE)
        sold_24h = int(sold_match.group(1)) if sold_match else 0

        # "X sold" general
        if not sold_24h:
            gsold_match = re.search(r"(\d+)\s*sold\b", item_text, re.IGNORECASE)
            if gsold_match:
                sold_24h = min(int(gsold_match.group(1)), 5)  # cap estimate

        # "X watching"
        watch_match = re.search(r"(\d+)\s*watching", item_text, re.IGNORECASE)
        watch_count = int(watch_match.group(1)) if watch_match else 0

        almost_gone = bool(re.search(r"\bAlmost gone\b", item_text, re.IGNORECASE))

        trend_score = calculate_trend_score(
            sales_velocity=sold_24h,
            cart_adds=0,
            review_count=0,
            is_bestseller=False,
            watch_count=watch_count,
        )
        saturation = get_saturation_label(0, trend_score)

        if not title or not product_url:
            continue

        results.append({
            "platform": "ebay",
            "title": title,
            "image_url": image,
            "price": price,
            "currency": "USD",
            "product_url": product_url,
            "trend_score": trend_score,
            "in_carts": 0,
            "sold_last_24h": sold_24h,
            "watch_count": watch_count,
            "is_bestseller": False,
            "almost_gone": almost_gone,
            "saturation_label": saturation,
            "review_count": 0,
            "rating": None,
            "cache_date": str(date.today()),
        })

    print(f"[Cron] eBay found {len(results)} products for '{keyword}'")
    return results


# ── Main Cron Function ────────────────────────────────────────

async def refresh_global_cache() -> dict:
    """
    Main cron job function.
    Scrapes all sources concurrently, deduplicates, and upserts to Supabase.
    Called by APScheduler every 24h and by the admin manual-trigger endpoint.
    """
    print("\n[Cron] 🔄 Starting global cache refresh...")
    from lib.supabase_client import get_admin_client

    # ── Concurrent scraping ───────────────────────────────────
    etsy_tasks = [_scrape_etsy_category(url) for url in ETSY_CATEGORY_URLS]
    ebay_tasks = [_scrape_ebay_trending(kw) for kw in EBAY_TRENDING_SEARCHES]

    all_batches = await asyncio.gather(*etsy_tasks, *ebay_tasks, return_exceptions=True)

    all_products = []
    for batch in all_batches:
        if isinstance(batch, list):
            all_products.extend(batch)

    # Remove products with no title or price
    all_products = [p for p in all_products if p.get("title") and p.get("price", 0) > 0]

    # Sort by trend_score descending, keep top 50
    all_products.sort(key=lambda p: p.get("trend_score", 0), reverse=True)
    top_50 = all_products[:50]

    print(f"[Cron] 📊 Total scraped: {len(all_products)} → keeping top {len(top_50)}")

    if not top_50:
        return {"success": False, "error": "No products scraped", "count": 0}

    # ── Upsert to Supabase ────────────────────────────────────
    try:
        supabase = get_admin_client()

        # Delete today's stale cache for clean replacement
        today = str(date.today())
        supabase.from_("global_cache_products").delete().eq("cache_date", today).execute()

        # Insert in batches of 25 to avoid payload limits
        for i in range(0, len(top_50), 25):
            batch = top_50[i:i + 25]
            supabase.from_("global_cache_products").insert(batch).execute()

        print(f"[Cron] ✅ Saved {len(top_50)} products to global_cache_products")
        return {"success": True, "count": len(top_50), "date": today}

    except Exception as e:
        print(f"[Cron] ❌ Supabase insert failed: {e}")
        return {"success": False, "error": str(e), "count": 0}


# ── APScheduler Setup ─────────────────────────────────────────

def create_scheduler():
    """
    Create and return an APScheduler AsyncIOScheduler instance.
    Attach to FastAPI lifespan to start/stop automatically.

    Usage in main.py:
        from scrapers.cron import create_scheduler

        @asynccontextmanager
        async def lifespan(app):
            scheduler = create_scheduler()
            scheduler.start()
            yield
            scheduler.shutdown()
    """
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        from apscheduler.triggers.interval import IntervalTrigger

        scheduler = AsyncIOScheduler()
        scheduler.add_job(
            refresh_global_cache,
            trigger=IntervalTrigger(hours=24),
            id="global_cache_refresh",
            name="Global Cache Refresh",
            replace_existing=True,
            max_instances=1,  # Prevent overlap
        )
        print("[Cron] ✅ Scheduler configured — 24h global cache refresh")
        return scheduler

    except ImportError:
        print("[Cron] ⚠️ APScheduler not installed. Run: pip install apscheduler")
        return None
