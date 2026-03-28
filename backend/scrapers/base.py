"""
TrendHawk — BaseScraper
Abstract base class for all platform scrapers (eBay, Etsy, future platforms).

Architecture:
  1. httpx.AsyncClient with fake_useragent + stealth headers (cheap, fast)
  2. On 403/429/CAPTCHA → graceful fallback to Playwright residential proxy
  3. Subclasses implement: parse(html, url) -> dict
"""
import asyncio
import random
import re
from abc import ABC, abstractmethod
from typing import Optional

import httpx

try:
    from fake_useragent import UserAgent
    _ua = UserAgent()

    def get_random_ua() -> str:
        try:
            return _ua.chrome
        except Exception:
            return _FALLBACK_UAS[0]
except ImportError:
    _ua = None

    def get_random_ua() -> str:
        return random.choice(_FALLBACK_UAS)


_FALLBACK_UAS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
]

_CAPTCHA_PATTERNS = re.compile(
    r"captcha|robot|blocked|pardon our interruption|geo\.captcha-delivery"
    r"|security measure|verify you|are you human|unusual traffic",
    re.IGNORECASE,
)


def _build_stealth_headers(ua: str, referer: str = "https://www.google.com/") -> dict:
    """Build a realistic browser request header set to evade bot detection."""
    return {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Referer": referer,
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "DNT": "1",
        "Connection": "keep-alive",
        "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
    }


class BaseScraper(ABC):
    """
    Abstract base class for all TrendHawk platform scrapers.

    Subclasses MUST implement:
        parse(html: str, url: str) -> dict

    Usage:
        class EbayScraper(BaseScraper):
            async def parse(self, html, url):
                ...
        scraper = EbayScraper()
        data = await scraper.fetch_and_parse("https://www.ebay.com/itm/...")
    """

    # Override in subclass if the platform needs a specific referer
    DEFAULT_REFERER = "https://www.google.com/"
    # Minimum acceptable HTML size (bytes) — smaller = probably an error page
    MIN_HTML_SIZE = 3_000
    # HTTP status codes that should trigger residential proxy fallback
    BLOCK_STATUS_CODES = {403, 429, 503}

    def __init__(self):
        from lib.proxy import get_proxy_dict, get_proxy_url
        self._get_proxy_dict = get_proxy_dict
        self._get_proxy_url = get_proxy_url

    # ── Public API ────────────────────────────────────────────

    async def fetch(self, url: str) -> Optional[str]:
        """
        Fetch a URL using the proxy waterfall strategy:
          1. Datacenter proxy via httpx (cheap)
          2. Direct httpx (no proxy fallback)
          3. Residential proxy via Playwright (expensive, last resort)

        Returns raw HTML string or None on total failure.
        """
        ua = get_random_ua()
        headers = _build_stealth_headers(ua, self.DEFAULT_REFERER)
        proxy_url = self._get_proxy_url()

        # ── Stage 1: Datacenter Proxy ─────────────────────────
        if proxy_url:
            html = await self._httpx_fetch(url, headers, proxy_url)
            if html:
                self._log(f"✅ Datacenter proxy OK: {url[:60]}")
                return html
            self._log(f"⚠️ Datacenter proxy failed/blocked: {url[:60]}")

        # ── Stage 2: Direct (no proxy) ────────────────────────
        html = await self._httpx_fetch(url, headers, None)
        if html:
            self._log(f"✅ Direct OK: {url[:60]}")
            return html
        self._log(f"⚠️ Direct also failed: {url[:60]}")

        # ── Stage 3: Residential Proxy via Playwright ─────────
        self._log(f"🔄 Escalating to Playwright residential: {url[:60]}")
        html = await self._playwright_fetch(url, ua)
        if html:
            self._log(f"✅ Playwright OK: {url[:60]}")
        else:
            self._log(f"❌ All strategies failed: {url[:60]}")
        return html

    async def fetch_and_parse(self, url: str) -> dict:
        """Convenience method: fetch HTML then parse it."""
        html = await self.fetch(url)
        if not html:
            return {"success": False, "error": "Failed to fetch page — all strategies exhausted"}
        if self.is_captcha(html[:8_000]):
            return {"success": False, "error": "Bot detection / CAPTCHA triggered"}
        return await self.parse(html, url)

    @abstractmethod
    async def parse(self, html: str, url: str) -> dict:
        """
        Extract structured product data from the raw HTML.
        Must return a dict with at minimum {"success": bool}.
        """
        ...

    # ── Bot Detection Helpers ─────────────────────────────────

    def is_captcha(self, snippet: str) -> bool:
        """Return True if the HTML snippet looks like a CAPTCHA/block page."""
        return bool(_CAPTCHA_PATTERNS.search(snippet))

    def is_blocked_response(self, response: httpx.Response) -> bool:
        """Return True if the HTTP response indicates we've been blocked."""
        if response.status_code in self.BLOCK_STATUS_CODES:
            return True
        if response.status_code == 200:
            text = response.text[:8_000]
            return self.is_captcha(text)
        return False

    # ── Private Transport Methods ─────────────────────────────

    async def _httpx_fetch(
        self,
        url: str,
        headers: dict,
        proxy: Optional[str],
    ) -> Optional[str]:
        """Send a request via httpx, return HTML or None."""
        kwargs = {
            "timeout": 30,
            "headers": headers,
            "follow_redirects": True,
        }
        if proxy:
            kwargs["proxy"] = proxy

        for attempt in range(2):
            try:
                async with httpx.AsyncClient(**kwargs) as client:
                    res = await client.get(url)
                    if self.is_blocked_response(res):
                        return None
                    if len(res.text) < self.MIN_HTML_SIZE:
                        return None
                    return res.text
            except (httpx.TimeoutException, httpx.ConnectError, httpx.ProxyError) as e:
                self._log(f"httpx error ({type(e).__name__}): {e} (attempt {attempt+1}/2)")
                if attempt == 0:
                    await asyncio.sleep(1)
                continue
            except Exception as e:
                self._log(f"httpx unexpected error: {e}")
                return None
        return None

    async def _playwright_fetch(self, url: str, ua: str) -> Optional[str]:
        """
        Fetch a page using Playwright + optional residential proxy.
        Uses playwright-stealth if installed for maximum bypass capability.
        Runs in a separate thread to avoid Windows NotImplementedError with asyncio.create_subprocess_exec.
        """
        import anyio
        return await anyio.to_thread.run_sync(self._playwright_fetch_sync, url, ua)

    def _playwright_fetch_sync(self, url: str, ua: str) -> Optional[str]:
        import sys
        import asyncio
        import time
        if sys.platform == "win32":
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
            
        try:
            from playwright.sync_api import sync_playwright

            try:
                from playwright_stealth import stealth_sync
            except ImportError:
                stealth_sync = None

            proxy_url = self._get_proxy_url()
            proxy_config = {"server": proxy_url} if proxy_url else None

            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    proxy=proxy_config,
                    args=[
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-blink-features=AutomationControlled",
                        "--disable-dev-shm-usage",
                    ],
                )
                context = browser.new_context(
                    viewport={"width": 1920, "height": 1080},
                    user_agent=ua,
                    locale="en-US",
                    extra_http_headers={
                        "Accept-Language": "en-US,en;q=0.9",
                        "DNT": "1",
                    },
                )
                page = context.new_page()

                if stealth_sync:
                    stealth_sync(page)

                # Hide webdriver flag
                page.evaluate(
                    "Object.defineProperty(navigator, 'webdriver', {get: () => false})"
                )

                page.goto(url, wait_until="networkidle", timeout=60_000)

                # Human-like scroll to trigger lazy-loaded content
                for _ in range(4):
                    if not page.is_closed():
                        page.evaluate("window.scrollBy(0, 300);")
                        page.wait_for_timeout(400)
                
                if not page.is_closed():
                    page.wait_for_timeout(1500)
                    content = page.content()
                else:
                    content = ""

                browser.close()

                if self.is_captcha(content[:8_000]):
                    self._log("⛔ Playwright also blocked (CAPTCHA)")
                    return None
                if len(content) < self.MIN_HTML_SIZE:
                    return None
                return content

        except Exception as e:
            self._log(f"Playwright error: {e}")
            return None

    # ── Logging ────────────────────────────────────────────────

    def _log(self, msg: str):
        """Prefixed log output including scraper class name."""
        print(f"[{self.__class__.__name__}] {msg}")
