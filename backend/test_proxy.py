import httpx
import asyncio
from urllib.parse import quote

async def test_proxy():
    host = "gate.decodo.com"
    port = "10001"
    user = "sp5kk8mbiv"
    pwd = "bzy6ksKcW4tzZf3=G0"
    
    # 1. Unencoded
    url_unencoded = f"http://{user}:{pwd}@{host}:{port}"
    print(f"Testing UNENCODED: {url_unencoded}")
    try:
        async with httpx.AsyncClient(proxy=url_unencoded, verify=False, timeout=10) as client:
            res = await client.get("http://ip-api.com/json")
            print("✅ Unencoded success:", res.text)
    except Exception as e:
        print("❌ Unencoded failed:", e)
        
    print("-" * 30)
    
    # 2. Encoded
    url_encoded = f"http://{quote(user)}:{quote(pwd)}@{host}:{port}"
    print(f"Testing ENCODED: {url_encoded}")
    try:
        async with httpx.AsyncClient(proxy=url_encoded, verify=False, timeout=10) as client:
            res = await client.get("http://ip-api.com/json")
            print("✅ Encoded success:", res.text)
    except Exception as e:
        print("❌ Encoded failed:", e)

if __name__ == "__main__":
    asyncio.run(test_proxy())
