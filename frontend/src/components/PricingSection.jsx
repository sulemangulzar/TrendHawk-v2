import { Check, Lock } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

export function PricingSection({ currentPlan = "free", onUpgrade }) {
  const plans = [
    {
      id: "free",
      name: "Beta Tester",
      tag: "Live Now",
      tagColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
      price: 0,
      headline: "Everything Unlocked for Testing.",
      features: [
        "2 total searches (Testing Limit)",
        "Daily trending (eBay + Etsy)",
        "Track up to 10 products",
        "Full Profit Analytics",
        "Expense Calculator Unlocked",
        "TikTok Radar (Soon)",
      ],
      cta: "Testing Only",
      ctaHref: "/login",
      live: true,
      highlight: true,
    },
    {
      id: "starter",
      name: "Starter",
      tag: "Disabled",
      tagColor: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
      price: 9,
      headline: "For side-hustlers testing product ideas.",
      features: [
        "10 manual searches / month",
        "Track up to 5 products",
        "TikTok Radar (Coming Soon)",
        "Expense & Profit (Coming Soon)",
        "Save unlimited products",
      ],
      cta: "Coming Soon",
      ctaHref: "#",
      live: false,
      highlight: false,
    },
    {
      id: "pro",
      name: "Growth",
      tag: "Disabled",
      tagColor: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
      price: 19,
      headline: "For serious sellers scaling their store.",
      features: [
        "30 manual searches / month",
        "Track up to 15 products",
        "Elite Supplier Sourcing",
        "Expense & Profit (Coming Soon)",
      ],
      cta: "Coming Soon",
      ctaHref: "#",
      live: false,
      highlight: false,
    },
    {
      id: "expert",
      name: "Expert",
      tag: "Disabled",
      tagColor: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
      price: 29,
      headline: "For agencies dominating their niche.",
      features: [
        "50 manual searches / month",
        "Track up to 30 products",
        "Sourcing + Historical Data",
        "Expense & Profit (Coming Soon)",
      ],
      cta: "Coming Soon",
      ctaHref: "#",
      live: false,
      highlight: false,
    },
  ];

  return (
    <div className="w-full py-12 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Simple, Transparent <span className="text-teal-500">Pricing</span>
        </h2>
        <p className="text-zinc-500 font-medium max-w-lg mx-auto">
          Choose a plan that fits your growth stage. Scale faster with real-time market intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col p-7 rounded-3xl border transition-all duration-300",
              plan.highlight
                ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-2xl scale-[1.02] z-10"
                : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800",
              !plan.live && "opacity-80",
            )}
          >
            {/* Tag */}
            <div className="mb-5">
              <Badge
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest border px-3 py-1 rounded-full",
                  plan.tagColor,
                )}
              >
                {plan.tag}
              </Badge>
            </div>

            {/* Name + Price */}
            <div className="mb-6 space-y-1">
              <h3
                className={cn(
                  "text-lg font-black uppercase tracking-widest",
                  plan.highlight
                    ? "text-zinc-400 dark:text-zinc-500"
                    : "text-zinc-500",
                )}
              >
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">
                  ${plan.price}
                </span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    plan.highlight
                      ? "text-zinc-400 dark:text-zinc-500"
                      : "text-zinc-400",
                  )}
                >
                  /mo
                </span>
              </div>
              <p
                className={cn(
                  "text-xs font-medium mt-2",
                  plan.highlight
                    ? "text-zinc-400 dark:text-zinc-600"
                    : "text-zinc-400",
                )}
              >
                {plan.headline}
              </p>
            </div>

            {/* Features */}
            <div className="flex-1 space-y-3 mb-7">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      plan.highlight
                        ? "bg-teal-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-900 text-teal-500",
                    )}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      plan.highlight
                        ? "text-zinc-300 dark:text-zinc-700"
                        : "text-zinc-600 dark:text-zinc-400",
                    )}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {plan.live ? (
              <Button
                asChild
                className={cn(
                  "w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  "bg-teal-500 text-white hover:bg-teal-600",
                )}
              >
                <Link to={plan.ctaHref || "/login"}>{plan.cta}</Link>
              </Button>
            ) : (
              <Button
                disabled
                className={cn(
                  "w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed",
                  plan.highlight
                    ? "bg-zinc-700 text-zinc-400 border-none"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600",
                )}
              >
                <Lock className="mr-2 h-3 w-3" />
                {plan.cta}
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
          All prices in USD. Secure checkout powered by Lemon Squeezy.
        </p>
      </div>
    </div>
  );
}
