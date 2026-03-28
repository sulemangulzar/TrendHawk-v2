"""
TrendHawk Standalone Background Worker
Initializes and runs the APScheduler for global cache and tracked product sync.
Must be run as a separate process from the API to enable horizontal scaling.

Usage:
  cd backend
  python worker.py
"""
import asyncio
import sys

from scrapers.cron import create_scheduler

async def main():
    scheduler = create_scheduler()
    if scheduler:
        scheduler.start()
        print("[Worker] ✅ Background scheduler running. Press Ctrl+C to exit.")
        try:
            while True:
                await asyncio.sleep(3600)
        except (KeyboardInterrupt, SystemExit):
            scheduler.shutdown()
            print("[Worker] 🛑 Scheduler stopped.")
    else:
        print("[Worker] ❌ Failed to start scheduler.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(main())
