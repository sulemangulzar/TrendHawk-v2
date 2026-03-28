"""
Centralized Plan Configuration for Trendhawk (Python port of lib/plans.js)
"""

PLANS = {
    "free": {
        "id": "free",
        "name": "Starter",
        "displayName": "Free Starter",
        "price": 0,
        "billing": "forever",
        "isLive": True,
        "limits": {"credits": 3, "trackedProducts": 3},
        "features": {
            "sourcing": False,
            "profit": True,
            "expenseCalculator": True,
            "trending": "half",
            "alerts": False,
            "historicalData": True,
        },
        "description": "Basic market tracking",
        "cta": "Start Free",
    },
    "pro": {
        "id": "pro",
        "name": "Professional",
        "displayName": "Pro Plan",
        "price": 15,
        "billing": "monthly",
        "isLive": True,
        "limits": {"credits": 50, "trackedProducts": 50},
        "features": {
            "sourcing": True,
            "profit": True,
            "expenseCalculator": True,
            "trending": "full",
            "alerts": True,
            "historicalData": True,
        },
        "description": "For serious side-hustlers",
        "cta": "Upgrade Now",
        "popular": True,
    },
    "growth": {
        "id": "growth",
        "name": "Elite",
        "displayName": "Elite Plan",
        "price": 29,
        "billing": "monthly",
        "isLive": True,
        "limits": {"credits": 110, "trackedProducts": 1000},
        "features": {
            "sourcing": True,
            "profit": True,
            "expenseCalculator": True,
            "trending": "priority",
            "alerts": True,
            "historicalData": True,
            "csvExport": True,
        },
        "description": "For high-volume sellers",
        "cta": "Go Elite",
    },
}


def get_plan(plan_id: str) -> dict:
    return PLANS.get(plan_id, PLANS["free"])


def get_credit_limit(plan_id: str) -> int:
    return get_plan(plan_id)["limits"]["credits"]


def get_tracked_limit(plan_id: str) -> int:
    return get_plan(plan_id)["limits"]["trackedProducts"]


def get_all_plans() -> list:
    return list(PLANS.values())
