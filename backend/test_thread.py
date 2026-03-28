import asyncio
import anyio
from lib.supabase_client import get_admin_client

async def main():
    supabase = get_admin_client()
    res = supabase.from_("profiles").select("*").eq("id", "bogus").maybe_single().execute()
    print("RES IS:", type(res), res)

if __name__ == "__main__":
    asyncio.run(main())
