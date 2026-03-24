"""
Etsy Scraper — extends BaseScraper
Implements Etsy-specific "Goldmine" selectors:
  - "In X people's carts" (highest demand signal on Etsy)
  - "Bestseller" badge detection
  - JSON-LD structured data extraction
  - Category-based trending via the cron job
"""
import re
import asyncio
import json
from bs4 import BeautifulSoup
from scrapers.base import BaseScraper
from lib.trend_score import calculate_trend_score, get_saturation_label


def parse_price(text: str) -> float:
    m = re.search(r"[\d,]+\.?\d*", str(text).replace(",", ""))
    if m:
        try:
            p = float(m.group().replace(",", ""))
            return round(p, 2) if 0 < p < 100_000 else 0
        except ValueError:
            pass
    return 0


class EtsyScraper(BaseScraper):
    DEFAULT_REFERER = "https://www.google.com/"
    MIN_HTML_SIZE = 5_000

    async def parse(self, html: str, url: str) -> dict:
        return parse_listing_page(html, url)


def _extract_cart_adds(text: str) -> int:
    """
    Extract the "In X people's carts" demand signal from page text.
    Etsy uses variations like:
      - "In 27 people's carts"
      - "In over 20 people's carts"
      - "27 people have this in their cart"
    """
    patterns = [
        r"[Ii]n (\d+)\+?\s*(?:people|person)'?s?\s*cart",
        r"[Ii]n over (\d+)\s*people",
        r"(\d+)\s*people have this in their cart",
        r"(\d+)\s*in carts",
    ]
    for pattern in patterns:
        m = re.search(pattern, text)
        if m:
            return int(m.group(1))
    return 0


def _extract_favorites(text: str) -> int:
    """Extract Etsy favorites count from page text."""
    m = re.search(r"([\d,]+)\s*(?:people\s+)?(?:favorited|fav(?:ourite)?s?|♥)", text, re.IGNORECASE)
    if m:
        return int(m.group(1).replace(",", ""))
    return 0


def parse_listing_page(html: str, url: str) -> dict:
    """Parse an Etsy listing page and extract all product data."""
    soup = BeautifulSoup(html, "lxml")
    full_text = soup.get_text(" ", strip=True)

    data = {
        "title": None, "price": 0, "totalSales": None, "rating": None,
        "reviewCount": 0, "favorites": 0, "tags": [], "sellerName": None,
        "image": None, "url": url, "competitionLevel": "N/A",
        # Demand signals
        "in_carts": 0, "is_bestseller": False,
    }

    # Title
    title_el = (
        soup.select_one("h1[data-buy-box-listing-title]") or
        soup.select_one("h1.wt-text-body-01") or
        soup.select_one("h1") or
        soup.select_one('meta[property="og:title"]')
    )
    if title_el:
        data["title"] = (title_el.get("content") if title_el.name == "meta" else title_el.get_text(strip=True))
        if data["title"]:
            data["title"] = data["title"].split(" | Etsy")[0].strip()

    # Price
    for sel in ["p.wt-text-title-03", "span.wt-text-title-03",
                '[data-buy-box-region="price"] .wt-text-title-03']:
        el = soup.select_one(sel)
        if el:
            p = parse_price(el.get_text())
            if p > 0:
                data["price"] = p
                break
    if not data["price"]:
        el = soup.select_one('meta[property="product:price:amount"]')
        if el:
            data["price"] = parse_price(el.get("content"))

    # Image
    el = soup.select_one('meta[property="og:image"]')
    if el:
        data["image"] = el.get("content")
    if not data["image"]:
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if "etsystatic" in src:
                data["image"] = src
                break

    # Seller name
    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if "/shop/" in href:
            name = a.get_text(strip=True)
            if name and "Sale" not in name and len(name) < 60:
                data["sellerName"] = name
                break

    # JSON-LD structured data (most reliable source)
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            ld = json.loads(script.string or "{}")
            if isinstance(ld, list):
                ld = next((x for x in ld if x.get("@type") in ["Product", "ItemList"]), {})
            if ld.get("@type") == "Product":
                if not data["title"] and ld.get("name"):
                    data["title"] = ld["name"]
                if not data["price"] and ld.get("offers", {}).get("price"):
                    data["price"] = float(ld["offers"]["price"])
                if not data["image"] and ld.get("image"):
                    img = ld["image"]
                    data["image"] = img[0] if isinstance(img, list) else img
                if ld.get("aggregateRating"):
                    data["rating"] = float(ld["aggregateRating"].get("ratingValue", 0) or 0)
                    data["reviewCount"] = int(str(ld["aggregateRating"].get("reviewCount", 0)).replace(",", ""))
                break
        except Exception:
            pass

    # Rating fallback
    if not data["rating"]:
        el = soup.select_one("[data-rating-average]")
        if el:
            try:
                data["rating"] = float(el.get("data-rating-average", 0))
            except ValueError:
                pass

    # Review count fallback
    if not data["reviewCount"]:
        for sel in ["span.wt-badge--rating-count", 'a[href="#reviews"]',
                    '[data-wt-link="listing_reviews_section"]']:
            el = soup.select_one(sel)
            if el:
                m = re.search(r"(\d+)", el.get_text().replace(",", ""))
                if m:
                    data["reviewCount"] = int(m.group(1))
                    break

    # ── "Goldmine" Demand Signals ─────────────────────────────

    # "In X people's carts"
    data["in_carts"] = _extract_cart_adds(full_text)

    # Bestseller badge
    data["is_bestseller"] = bool(
        soup.select_one('[class*="bestseller"]') or
        re.search(r"\bBestseller\b", full_text, re.IGNORECASE)
    )

    # Favorites
    data["favorites"] = _extract_favorites(full_text)

    # Tags
    meta_kw = soup.select_one('meta[name="keywords"]')
    if meta_kw:
        data["tags"] = [t.strip() for t in (meta_kw.get("content") or "").split(",") if t.strip()][:13]

    return data


async def scrape_etsy_listing(url: str) -> dict:
    """Scrape a single Etsy listing and return enriched product data."""
    print(f"\n[Etsy] 📦 Listing: {url}")
    scraper = EtsyScraper()
    html = await scraper.fetch(url)

    if not html:
        return {"success": False, "error": "Etsy bot detection (DataDome) — all bypass methods failed."}

    data = parse_listing_page(html, url)

    if not data["title"]:
        return {"success": False, "error": "Could not parse Etsy listing data"}

    listing_age_months = 12
    monthly_sales = round(data["totalSales"] / listing_age_months) if data["totalSales"] else None
    revenue_est = round(monthly_sales * data["price"], 2) if monthly_sales and data["price"] else None

    trend_score = calculate_trend_score(
        sales_velocity=0,
        cart_adds=data.get("in_carts", 0),
        review_count=data["reviewCount"],
        is_bestseller=data.get("is_bestseller", False),
        watch_count=data.get("favorites", 0),
    )
    saturation = get_saturation_label(data["reviewCount"], trend_score)

    return {
        "success": True,
        "product": {
            **data,
            "monthlySales": monthly_sales,
            "revenueEst": revenue_est,
            "trendScore": trend_score,
            "saturationLabel": saturation,
            "platform": "etsy",
        },
    }


async def search_etsy(keyword: str, deep_scan_top: int = 5) -> dict:
    """Search Etsy by keyword and return enriched listings."""
    search_url = f"https://www.etsy.com/search?q={keyword.replace(' ', '+')}&order=most_relevant"
    scraper = EtsyScraper()
    print(f"\n[Etsy] 🔍 Search: {keyword}")

    html = await scraper.fetch(search_url)
    if not html:
        return {"success": False, "error": "Etsy search blocked", "listings": []}

    soup = BeautifulSoup(html, "lxml")
    listings = []

    for item in soup.select("[data-listing-id]"):
        listing_id = item.get("data-listing-id")
        if not listing_id:
            continue
        a = item.select_one('a[href*="/listing/"]')
        href = a.get("href", "") if a else ""
        item_url = href.split("?")[0] if href.startswith("http") else f"https://www.etsy.com{href.split('?')[0]}"

        title_el = item.select_one("h3") or item.select_one('[class*="title"]')
        title = title_el.get_text(strip=True) if title_el else ""

        price_el = item.select_one(".currency-value")
        price = parse_price(price_el.get_text()) if price_el else 0

        img_el = item.select_one("img")
        image = (img_el.get("src") or img_el.get("data-src")) if img_el else None

        item_text = item.get_text(" ", strip=True)
        in_carts = _extract_cart_adds(item_text)
        is_bestseller = bool(
            item.select_one('[class*="bestseller"]') or
            re.search(r"\bBestseller\b", item_text, re.IGNORECASE)
        )

        trend_score = calculate_trend_score(
            sales_velocity=0,
            cart_adds=in_carts,
            review_count=0,
            is_bestseller=is_bestseller,
        )

        if not title or not item_url:
            continue

        listings.append({
            "listingId": listing_id, "title": title, "price": price,
            "image": image, "url": item_url, "platform": "etsy",
            "in_carts": in_carts, "is_bestseller": is_bestseller,
            "trend_score": trend_score,
            "saturation_label": get_saturation_label(0, trend_score),
        })

    if not listings:
        return {"success": False, "error": "No listings found in search results", "listings": []}

    # Deep scan top N listings
    enriched = []
    for i, item in enumerate(listings[:deep_scan_top]):
        await asyncio.sleep(i * 0.8)
        try:
            res = await scrape_etsy_listing(item["url"])
            if res["success"]:
                enriched.append({**item, **res["product"]})
            else:
                enriched.append(item)
        except Exception:
            enriched.append(item)

    all_listings = enriched + listings[deep_scan_top:]
    return {"success": True, "keyword": keyword, "platform": "etsy", "listings": all_listings}
