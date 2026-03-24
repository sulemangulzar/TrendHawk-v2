"""
TrendHawk — Weighted Trend Score Utility
calculate_trend_score() is the single source of truth for scoring products
across all platforms (eBay, Etsy, and future platforms).

Score breakdown (max 100):
  - Sales velocity (24h)   : 0–40  HIGH weight
  - Cart adds              : 0–35  HIGH weight
  - Bestseller badge       : +15   MEDIUM
  - Watch count (eBay)     : 0–10
  - Review count           : 0–10  (popularity signal)
  - Saturation penalty     : –20   (>10k reviews = crowded market)
"""


def calculate_trend_score(
    sales_velocity: int = 0,   # units sold in last 24h (eBay "X sold in last 24h")
    cart_adds: int = 0,        # "In X people's carts" (Etsy demand signal)
    review_count: int = 0,     # total product reviews
    is_bestseller: bool = False,  # "Bestseller" badge present
    watch_count: int = 0,      # eBay watchers / Etsy favorites
) -> int:
    """
    Return a weighted trend score from 0 to 100.

    Args:
        sales_velocity: Number of units sold in the last 24 hours.
        cart_adds:      Number of shoppers who have this in their cart right now.
        review_count:   Total cumulative reviews (high count = saturation signal).
        is_bestseller:  True if the platform shows a "Bestseller" badge.
        watch_count:    eBay watch count or Etsy favorites count.

    Returns:
        int: Score clamped between 0 and 100.
    """
    score = 0

    # ── Sales Velocity (max 40) ───────────────────────────────
    # HIGH weight: real-time buying demand
    if sales_velocity >= 30:
        score += 40
    elif sales_velocity >= 15:
        score += 32
    elif sales_velocity >= 5:
        score += 20
    elif sales_velocity >= 1:
        score += 10

    # ── Cart Adds (max 35) ────────────────────────────────────
    # HIGH weight: strongest real-time demand signal on Etsy
    if cart_adds >= 50:
        score += 35
    elif cart_adds >= 20:
        score += 28
    elif cart_adds >= 10:
        score += 18
    elif cart_adds >= 3:
        score += 8

    # ── Bestseller Badge (flat +15) ───────────────────────────
    # MEDIUM weight: platform-verified top seller
    if is_bestseller:
        score += 15

    # ── Watch / Favorites Count (max 10) ──────────────────────
    if watch_count >= 200:
        score += 10
    elif watch_count >= 50:
        score += 7
    elif watch_count >= 10:
        score += 4

    # ── Review Count — Popularity Signal (max 10) ─────────────
    # Some reviews = validated product; too many = saturated
    if 50 <= review_count <= 2000:
        score += 10
    elif review_count <= 10000:
        score += 5

    # ── Saturation Penalty ────────────────────────────────────
    # Massive review count = crowded race-to-the-bottom market
    if review_count > 10_000:
        score -= 20

    return max(0, min(100, score))


def get_saturation_label(review_count: int, trend_score: int) -> str:
    """
    Return a market saturation label based on reviews and trend score.

    Returns:
        "Untapped"  — Low reviews, good recent sales signal (green)
        "Trending"  — Healthy demand, moderate reviews
        "Saturated" — Massive review count or low trend score
    """
    if review_count > 10_000 or trend_score < 25:
        return "Saturated"
    if review_count < 200 and trend_score >= 50:
        return "Untapped"
    return "Trending"
