import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from scrapers.etsy import scrape_etsy_listing

async def test_live_etsy():
    url = "https://www.etsy.com/listing/1269324684/14k-solid-gold-name-necklace-personalized"
    print(f"Initiating proxy scraper on the discovered URL: {url}")
    
    try:
        res = await scrape_etsy_listing(url)
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
    asyncio.run(test_live_etsy())
