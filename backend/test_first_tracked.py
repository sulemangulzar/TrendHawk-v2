import asyncio
import sys
import os

# Ensure backend root is in PYTHONPATH
sys.path.insert(0, os.path.dirname(__file__))

from lib.supabase_client import get_admin_client
from scrapers.ebay import scrape_ebay_product
from scrapers.etsy import scrape_etsy_listing

async def test_first():
    print("Fetching first product from global cache to test scraper...")
    supabase = get_admin_client()
    res = supabase.from_("global_cache_products").select("*").in_("platform", ["ebay", "etsy"]).limit(1).execute()
    items = res.data or []
    
    if not items:
        print("No items in global cache.")
        return
        
    item = items[0]
    title = item.get('title', 'Unknown')
    url = item.get('product_url', '')  # Note: it's product_url in global_cache_products
    platform = item.get('platform', '').lower()
    
    print(f"Target: {title}")
    print(f"URL: {url}")
    print(f"Platform: {platform}")
    print("-" * 40)
    print("Initiating proxy scraper on the live URL...")
    
    try:
        if platform == "ebay":
            result = await scrape_ebay_product(url)
        elif platform == "etsy":
            result = await scrape_etsy_listing(url)
        else:
            print(f"Unsupported platform: {platform}")
            return
            
        if not result.get("success"):
            print(f"❌ Scrape failed: {result.get('error', 'Unknown error')}")
            return
            
        product = result.get("product", {})
        price = product.get("currentPrice") or product.get("price")
        
        print("✅ Scrape successful!")
        print(f"Live Price:     {price} {product.get('currency', 'USD')}")
        print(f"Trend Score:    {product.get('trendScore', 0)}")
        print(f"Sales/Velocity: {product.get('soldQuantity', 0)}")
        print(f"Reviews/Rating: {product.get('reviewsCount', 0)} ({product.get('rating', 'N/A')}⭐)")
        print(f"Seller:         {product.get('sellerName', 'Unknown')}")
        
    except Exception as e:
        print(f"❌ Exception during scrape: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_first())
