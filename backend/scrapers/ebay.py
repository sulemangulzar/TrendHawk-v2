"""
eBay Scraper — extends BaseScraper
Uses the BaseScraper proxy waterfall (httpx datacenter → direct → Playwright residential).
Implements the full "Goldmine" selector set for demand signals.
"""
import re
import asyncio
from bs4 import BeautifulSoup
from scrapers.base import BaseScraper
from lib.trend_score import calculate_trend_score, get_saturation_label


def parse_price(text: str) -> float:
    if not text:
        return 0
    lower = str(text).split(" to ")[0]
    m = re.search(r"[\d,]+\.?\d*", lower.replace(",", ""))
    if m:
        try:
            p = float(m.group().replace(",", ""))
            if 0 < p < 100_000:
                return round(p, 2)
        except ValueError:
            pass
    return 0


def parse_int(text: str) -> int:
    m = re.search(r"[\d,]+", str(text).replace(",", ""))
    return int(m.group().replace(",", "")) if m else 0


class EbayScraper(BaseScraper):
    DEFAULT_REFERER = "https://www.google.com/"

    async def parse(self, html: str, url: str) -> dict:
        return extract_listing_data(html, url)


def extract_listing_data(html: str, url: str) -> dict:
    """Extract product data from an eBay listing page HTML."""
    soup = BeautifulSoup(html, "lxml")
    data = {
        "title": None, "price": None, "mainImage": None,
        "soldQuantity": None, "rating": None, "reviewsCount": None,
        "sellerUsername": None, "sellerLink": None, "numberOfSellers": 1,
        "watchCount": None, "itemId": None,
        # Demand signal badges
        "sold_last_24h": 0, "almost_gone": False,
    }

    raw = html  # for regex fallbacks

    # Item ID
    m = re.search(r"/itm/(\d+)", url) or re.search(r"item=(\d+)", url)
    if m:
        data["itemId"] = m.group(1)
    if not data["itemId"]:
        m = re.search(r'"itemId":"(\d+)"', raw) or re.search(r'"itemID":"(\d+)"', raw)
        if m:
            data["itemId"] = m.group(1)

    # Title
    title_el = (
        soup.select_one(".x-item-title__mainTitle span") or
        soup.select_one('[data-testid="x-item-title"] span') or
        soup.select_one("#itemTitle") or
        soup.select_one('meta[property="og:title"]')
    )
    if title_el:
        data["title"] = (title_el.get("content") if title_el.name == "meta" else title_el.get_text(strip=True))
        if data["title"]:
            data["title"] = data["title"].replace("Condition:", "").strip()

    # Price
    for sel in [".x-price-primary .ux-textspans", ".x-price-primary",
                '[data-testid="x-price-section"] .ux-textspans', "#prcIsum",
                '[itemprop="price"]']:
        el = soup.select_one(sel)
        if el:
            p = parse_price(el.get("content") or el.get_text())
            if p > 0:
                data["price"] = p
                break

    # Image
    for sel in [".ux-image-carousel-item.active img", ".ux-image-carousel-item img",
                '#icImg', 'meta[property="og:image"]']:
        el = soup.select_one(sel)
        if el:
            src = el.get("content") or el.get("src") or ""
            if src.startswith("http"):
                data["mainImage"] = src
                break
    if not data["mainImage"]:
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if "i.ebayimg.com" in src:
                data["mainImage"] = src
                break

    # Rating
    rating_el = (soup.select_one('[data-testid="x-star-rating"] .ux-textspans') or
                 soup.select_one(".x-star-rating .ux-textspans"))
    if rating_el:
        m = re.search(r"([\d.]+)\s*out of", rating_el.get_text())
        if m:
            data["rating"] = float(m.group(1))

    # Review count
    for sel in ['.fdbk-detail-list__title .SECONDARY',
                '[data-testid="x-star-rating"] .ux-textspans--secondary',
                '.x-star-rating .ux-textspans--secondary']:
        el = soup.select_one(sel)
        if el:
            m = re.search(r"(\d+)", el.get_text().replace(",", ""))
            if m:
                data["reviewsCount"] = int(m.group(1))
                break
    if not data["reviewsCount"]:
        m = re.search(r'"feedbackScore"\s*:\s*(\d+)', raw)
        if m:
            data["reviewsCount"] = int(m.group(1))

    # Sold quantity
    full_text = soup.get_text(" ", strip=True)
    for sel in [".x-quantity__availability span", ".d-quantity__availability span",
                ".ux-textspans--EMPHASIS", "#qtyAvailability"]:
        el = soup.select_one(sel)
        if el:
            m = re.search(r"([\d,]+)\s+sold", el.get_text(), re.IGNORECASE)
            if m:
                data["soldQuantity"] = int(m.group(1).replace(",", ""))
                break
    if not data["soldQuantity"]:
        m = re.search(r"([\d,]+)\s+sold\b", raw, re.IGNORECASE)
        if m:
            data["soldQuantity"] = int(m.group(1).replace(",", ""))

    # ── Demand Signal Badges ──────────────────────────────────

    # "X+ sold in last 24 hours" — HIGH weight demand signal
    sold_24h_match = re.search(r"(\d+)\+?\s*sold in last 24", full_text, re.IGNORECASE)
    if sold_24h_match:
        data["sold_last_24h"] = int(sold_24h_match.group(1))

    # "Almost gone" badge
    data["almost_gone"] = bool(re.search(r"\bAlmost gone\b", full_text, re.IGNORECASE))

    # Watch count
    m = re.search(r"([\d,]+)\s+Watcher", raw, re.IGNORECASE) or re.search(r'"watchCount"\s*:\s*(\d+)', raw)
    if m:
        data["watchCount"] = int(m.group(1).replace(",", ""))

    # Seller
    for sel in [".x-sellercard-atf__info__about-seller a span",
                ".ux-seller-section__item--seller .ux-action span",
                ".mbg-name a", 'a[href*="/usr/"]']:
        el = soup.select_one(sel)
        if el:
            name = el.get_text(strip=True)
            href = el.get("href", "")
            if name and len(name) > 1 and "Feedback" not in name:
                data["sellerUsername"] = name
                data["sellerLink"] = href if href.startswith("http") else f"https://www.ebay.com{href}"
                break

    # Seller count
    m = re.search(r"(\d+)\s+(?:other\s+)?seller", raw, re.IGNORECASE)
    if m:
        data["numberOfSellers"] = int(m.group(1)) + 1

    return {"success": True, **data}


async def search_ebay(keyword: str, max_results: int = 20) -> dict:
    """
    Live eBay keyword search for paid users.
    Returns enriched product listings with demand signal badges.
    """
    search_url = (
        f"https://www.ebay.com/sch/i.html?_nkw={keyword.replace(' ', '+')}"
        f"&_sop=12&LH_TitleDesc=0"
    )
    scraper = EbayScraper()
    print(f"\n[eBay] 🔍 Live search: {keyword}")
    html = await scraper.fetch(search_url)

    if not html:
        return {"success": False, "error": "eBay search blocked", "listings": []}

    soup = BeautifulSoup(html, "lxml")
    listings = []

    for item in soup.select(".s-item")[:max_results + 3]:
        title_el = item.select_one(".s-item__title")
        title = title_el.get_text(strip=True) if title_el else ""
        if not title or title.lower().startswith("shop on ebay"):
            continue

        a = item.select_one("a.s-item__link")
        url = a.get("href", "").split("?")[0] if a else ""

        price_el = item.select_one(".s-item__price")
        price = parse_price(price_el.get_text()) if price_el else 0

        img_el = item.select_one("img")
        image = img_el.get("src") if img_el else None

        item_text = item.get_text(" ", strip=True)

        # Demand signals
        sold_match = re.search(r"(\d+)\+?\s*sold in last 24", item_text, re.IGNORECASE)
        sold_24h = int(sold_match.group(1)) if sold_match else 0

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

        listings.append({
            "title": title, "price": price, "image": image, "url": url,
            "platform": "ebay", "trend_score": trend_score,
            "sold_last_24h": sold_24h, "watch_count": watch_count,
            "almost_gone": almost_gone,
            "saturation_label": get_saturation_label(0, trend_score),
        })

    listings = [l for l in listings if l["title"] and l["url"]][:max_results]
    return {"success": True, "keyword": keyword, "platform": "ebay", "listings": listings}


async def scrape_ebay_product(url: str) -> dict:
    """Main entry point: scrape a single eBay listing with full analysis."""
    print(f"\n[eBay] Scraping: {url}")
    scraper = EbayScraper()

    html = await scraper.fetch(url)
    if not html:
        return {"success": False, "error": "Failed to fetch eBay page"}

    soup_check = BeautifulSoup(html, "lxml")
    page_title = soup_check.title.string if soup_check.title else ""
    if any(x in page_title.lower() for x in ["security measure", "robot", "verify"]):
        return {"success": False, "error": "eBay bot detection triggered"}

    result = extract_listing_data(html, url)
    if not result.get("success"):
        return result

    data = result
    print(f"[eBay] 📊 title={'✓' if data['title'] else '✗'} price={data['price']} sold={data['soldQuantity']}")

    # Playwright fallback if critical fields missing
    if not data["title"] or not data["price"]:
        print("[eBay] Missing critical fields, trying Playwright...")
        html2 = await scraper._playwright_fetch(url, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        if html2:
            r2 = extract_listing_data(html2, url)
            data["title"] = data["title"] or r2.get("title")
            data["price"] = data["price"] or r2.get("price")
            data["soldQuantity"] = data["soldQuantity"] or r2.get("soldQuantity")
            data["sellerUsername"] = data["sellerUsername"] or r2.get("sellerUsername")
            data["reviewsCount"] = data["reviewsCount"] or r2.get("reviewsCount")

    price = data["price"] or 0
    trend_score = calculate_trend_score(
        sales_velocity=data.get("sold_last_24h", 0),
        cart_adds=0,
        review_count=data["reviewsCount"] or 0,
        is_bestseller=False,
        watch_count=data["watchCount"] or 0,
    )
    saturation = get_saturation_label(data["reviewsCount"] or 0, trend_score)
    sellers = data.get("numberOfSellers", 1)
    competition = "High Comp" if sellers >= 10 else "Med Comp" if sellers >= 4 else "Low Comp"

    # Cost analysis
    cogs = round(price * 0.40, 2)
    referral_fee = round(price * 0.1275, 2)
    fba_fee = round(price * 0.05 if price >= 20 else price * 0.035, 2)
    shipping_cost = round(price * 0.10, 2)
    net_profit = round(price - cogs - referral_fee - fba_fee - shipping_cost, 2)
    margin = round((net_profit / price) * 100, 2) if price > 0 else 0

    estimated_monthly_sales = min(round((data["soldQuantity"] or 0) * 1.5), 1000)
    revenue_estimate = round(estimated_monthly_sales * price, 2)

    reasons = []
    if 15 <= price <= 60:
        reasons.append({"text": "Sweet spot pricing ($15–$60)", "type": "positive"})
    elif price > 60:
        reasons.append({"text": "Premium pricing — harder to compete", "type": "negative"})
    if margin > 25:
        reasons.append({"text": f"Strong margin ({round(margin)}%)", "type": "positive"})
    if (data["soldQuantity"] or 0) >= 100:
        reasons.append({"text": "High market demand", "type": "positive"})
    if competition == "Low Comp":
        reasons.append({"text": "Low competitive saturation", "type": "positive"})
    elif competition == "High Comp":
        reasons.append({"text": "High competition — enter carefully", "type": "negative"})
    if data.get("almost_gone"):
        reasons.append({"text": '"Almost Gone" — strong sell-through rate', "type": "positive"})
    if data.get("sold_last_24h", 0) >= 10:
        reasons.append({"text": f'{data["sold_last_24h"]} sold in last 24h 🔥', "type": "positive"})

    return {
        "success": True,
        "product": {
            **data,
            "currentPrice": price,
            "originalPrice": price,
            "currency": "USD",
            "platform": "ebay",
            "trendScore": trend_score,
            "competitionLevel": competition,
            "saturationLabel": saturation,
            "condition": "New",
            "shippingPrice": 0,
            "availability": "In Stock",
        },
        "analysis": {
            "score": trend_score,
            "trendScore": trend_score,
            "verdict": "BUY" if trend_score >= 70 else "WATCH" if trend_score >= 40 else "SKIP",
            "competitionLevel": competition,
            "saturationLabel": saturation,
            "netProfit": net_profit,
            "margin": margin,
            "cogs": cogs,
            "referralFee": referral_fee,
            "fbaFee": fba_fee,
            "shippingCost": shipping_cost,
            "numberOfSellers": sellers,
            "reviewsCount": data["reviewsCount"] or 0,
            "estimatedMonthlySales": estimated_monthly_sales,
            "revenueEstimate": revenue_estimate,
            "reasons": reasons,
        },
        "metadata": {"url": url, "itemId": data["itemId"]},
    }
