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
        "limits": {"credits": 2, "trackedProducts": 3},
        "features": {
            "sourcing": True,
            "profit": True,
            "expenseCalculator": True,
            "trending": "full",
            "alerts": False,
            "historicalData": True,
        },
        "description": "Get a taste of TrendHawk",
        "cta": "Start Free",
    },
    "basic": {
        "id": "basic",
        "name": "Basic",
        "displayName": "Basic Plan",
        "price": 5,
        "billing": "monthly",
        "isLive": False,
        "limits": {"credits": 10, "trackedProducts": 10},
        "features": {
            "sourcing": True,
            "profit": True,
            "expenseCalculator": True,
            "trending": "full",
            "alerts": False,
            "historicalData": True,
        },
        "description": "For side-hustlers testing the waters",
        "cta": "Coming Soon",
    },
    "pro": {
        "id": "pro",
        "name": "Pro",
        "displayName": "Pro Plan",
        "price": 9,
        "billing": "monthly",
        "isLive": False,
        "limits": {"credits": 20, "trackedProducts": 25},
        "features": {
            "sourcing": True,
            "profit": True,
            "expenseCalculator": True,
            "trending": "full",
            "alerts": False,
            "historicalData": True,
        },
        "description": "For serious sellers scaling up",
        "cta": "Coming Soon",
        "popular": True,
    },
    "growth": {
        "id": "growth",
        "name": "Growth",
        "displayName": "Growth Plan",
        "price": 15,
        "billing": "monthly",
        "isLive": False,
        "limits": {"credits": 35, "trackedProducts": 50},
        "features": {
            "sourcing": True,
            "profit": True,
            "expenseCalculator": True,
            "trending": "priority",
            "alerts": False,
            "historicalData": True,
            "csvExport": True,
        },
        "description": "For high-volume sellers & teams",
        "cta": "Coming Soon",
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
