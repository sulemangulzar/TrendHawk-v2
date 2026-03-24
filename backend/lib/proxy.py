"""
Proxy configuration for Decodo residential proxies.
Returns httpx-compatible proxy URL.
"""
import os
from dotenv import load_dotenv

load_dotenv()

PROXY_HOST = os.getenv("PROXY_HOST")
PROXY_PORT = os.getenv("PROXY_PORT")
PROXY_USER = os.getenv("PROXY_USER")
PROXY_PASS = os.getenv("PROXY_PASS")


def get_proxy_url() -> str | None:
    """Returns a proxy URL string for httpx, or None if not configured."""
    if not all([PROXY_HOST, PROXY_PORT, PROXY_USER, PROXY_PASS]):
        print("[Proxy] ⚠️  Proxy credentials not set — no proxy will be used")
        return None
    return f"http://{PROXY_USER}:{PROXY_PASS}@{PROXY_HOST}:{PROXY_PORT}"


def get_proxy_dict() -> dict | None:
    """Returns httpx proxies dict for use with httpx.AsyncClient."""
    url = get_proxy_url()
    if not url:
        return None
    return {
        "http://": url,
        "https://": url,
    }
