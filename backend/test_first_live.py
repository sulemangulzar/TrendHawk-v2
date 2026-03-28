import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from scrapers.ebay import scrape_ebay_product, search_ebay

async def test_live_ebay():
    print("1. Running live eBay search for 'iphone case' to get a valid URL...")
    try:
        search_res = await search_ebay("iphone case")
    except Exception as e:
        print(f"❌ Search exception: {e}")
        return

    if not search_res.get("success") or not search_res.get("products"):
        print("❌ Search returned no products.")
        return
        
    first_item = search_res["products"][0]
    title = first_item.get('title')
    url = first_item.get('product_url')
    print(f"✅ Search found: {title}")
    print(f"🔗 URL: {url}")
    print("-" * 40)
    print("2. Initiating proxy scraper on the discovered URL...")
    
    try:
        res = await scrape_ebay_product(url)
        if not res.get("success"):
            print(f"❌ Scrape failed: {res.get('error', 'Unknown error')}")
            return
            
        product = res.get("product", {})
        analysis = res.get("analysis", {})
        
        print("✅ Deep Scrape successful!")
        print(f"Live Price:       {product.get('currentPrice')} {product.get('currency', 'USD')}")
        print(f"Trend Score:      {product.get('trendScore', 0)}")
        print(f"Sales/Velocity:   {product.get('soldQuantity', 0)}")
        print(f"Reviews/Rating:   {product.get('reviewsCount', 0)} ({product.get('rating', 'N/A')}⭐)")
        print(f"Seller:           {product.get('sellerName', 'Unknown')}")
        print(f"Competition:      {analysis.get('competitionLevel', 'Unknown')}")
        print(f"P/L Margin:       {analysis.get('margin', 0)}%")
        print(f"Net Profit (est): {analysis.get('netProfit', 0)} USD")
        
    except Exception as e:
        print(f"❌ Exception during product scrape: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_live_ebay())
