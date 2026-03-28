import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from scrapers.base import BaseScraper
from scrapers.ebay import EbayScraper

async def test_p():
    print("Testing Playwright Directly...")
    s = cast(BaseScraper, EbayScraper())
    # Override stealth headers/random ua for test
    ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    url = "https://www.ebay.com/itm/116380691284"
    
    print("Invoking Playwright fallback...")
    res = await s._playwright_fetch(url, ua)
    
    if res is None:
        print("Playwright returned None.")
    else:
        print(f"Playwright returned {len(res)} bytes")
        print("Sample:", res[:500])

if __name__ == "__main__":
    from typing import cast
    asyncio.run(test_p())
