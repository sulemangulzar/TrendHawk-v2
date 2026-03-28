-- ============================================================
-- TrendHawk-v2 — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor → New Query
-- ============================================================

-- ── Enable UUID Extension ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users with app-specific metadata.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  avatar_url      TEXT,
  country         TEXT,
  experience_level TEXT,
  business_niche  TEXT,
  is_admin        BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, country, experience_level, business_niche)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'experience_level',
    NEW.raw_user_meta_data->>'business_niche'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- TABLE: user_usage
-- Tracks plan tier, credits consumed, and monthly resets.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_usage (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL DEFAULT 'free'
                    CHECK (plan IN ('free', 'basic', 'pro', 'growth', 'admin')),
  searches_used   INTEGER NOT NULL DEFAULT 0 CHECK (searches_used >= 0),
  tracked_count   INTEGER NOT NULL DEFAULT 0 CHECK (tracked_count >= 0),
  reset_date      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create usage row alongside profile
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_usage (user_id, reset_date)
  VALUES (NEW.id, NOW() + INTERVAL '30 days')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_usage ON public.profiles;
CREATE TRIGGER on_profile_created_usage
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_usage();

-- ============================================================
-- TABLE: global_cache_products
-- Stores daily trending products for free-tier users.
-- Overwritten/appended every 24 hours by the cron job.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.global_cache_products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform        TEXT NOT NULL CHECK (platform IN ('ebay', 'etsy')),
  title           TEXT NOT NULL,
  image_url       TEXT,
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'USD',
  product_url     TEXT,
  seller_name     TEXT,
  trend_score     INTEGER NOT NULL DEFAULT 0 CHECK (trend_score BETWEEN 0 AND 100),
  -- Demand signals / badges
  in_carts        INTEGER DEFAULT 0,   -- "In X people's carts" (Etsy)
  sold_last_24h   INTEGER DEFAULT 0,   -- "X sold in last 24 hours" (eBay)
  watch_count     INTEGER DEFAULT 0,   -- eBay watchers
  is_bestseller   BOOLEAN DEFAULT FALSE,
  almost_gone     BOOLEAN DEFAULT FALSE,
  -- Market analysis
  saturation_label TEXT CHECK (saturation_label IN ('Untapped', 'Trending', 'Saturated')),
  review_count    INTEGER DEFAULT 0,
  rating          NUMERIC(3, 2),
  -- Cache metadata
  scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cache_date      DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_global_cache_platform ON public.global_cache_products(platform);
CREATE INDEX IF NOT EXISTS idx_global_cache_trend_score ON public.global_cache_products(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_global_cache_date ON public.global_cache_products(cache_date DESC);

-- ============================================================
-- TABLE: saved_products  (The Vault)
-- Users bookmark products they want to revisit.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  price           NUMERIC(10, 2),
  image           TEXT,
  url             TEXT,
  platform        TEXT,
  seller          TEXT,
  trend_score     INTEGER DEFAULT 0,
  competition_level TEXT,
  raw_data        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, url)
);

CREATE INDEX IF NOT EXISTS idx_saved_products_user ON public.saved_products(user_id);

-- ============================================================
-- TABLE: tracked_products
-- Products the user actively tracks for price changes.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tracked_products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  price           NUMERIC(10, 2),
  image           TEXT,
  url             TEXT,
  platform        TEXT,
  asin            TEXT,
  seller          TEXT,
  reviews_count   INTEGER DEFAULT 0,
  rating          NUMERIC(3, 2),
  sold_quantity   INTEGER DEFAULT 0,
  trend_score     INTEGER DEFAULT 0,
  competition_level TEXT,
  raw_data        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracked_products_user ON public.tracked_products(user_id);

-- ============================================================
-- TABLE: price_history
-- Time-series snapshots of price/stock for tracked products.
-- Powers the Recharts historical price graphs (Pro+ feature).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.price_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID NOT NULL REFERENCES public.tracked_products(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price           NUMERIC(10, 2) NOT NULL,
  stock_level     INTEGER,
  sold_count      INTEGER,
  trend_score     INTEGER,
  scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_product ON public.price_history(product_id, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_user ON public.price_history(user_id);

-- ============================================================
-- TABLE: calculator_presets
-- User-saved profit calculator configurations (Basic+ feature).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.calculator_presets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  -- Cost variables
  item_cost       NUMERIC(10, 2) DEFAULT 0,
  shipping_cost   NUMERIC(10, 2) DEFAULT 0,
  ad_spend        NUMERIC(10, 2) DEFAULT 0,
  platform_fee_pct NUMERIC(5, 2) DEFAULT 12.75, -- %
  other_fees      NUMERIC(10, 2) DEFAULT 0,
  -- New flexible fields
  inputs          JSONB DEFAULT '[]',
  results         JSONB DEFAULT '{}',
  -- Optional notes
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calculator_presets_user ON public.calculator_presets(user_id);

-- ============================================================
-- TABLE: price_alerts
-- User-configured alerts for price drops or spikes.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.tracked_products(id) ON DELETE SET NULL,
  product_title   TEXT,
  target_price    NUMERIC(10, 2) NOT NULL,
  current_price   NUMERIC(10, 2),
  alert_type      TEXT NOT NULL DEFAULT 'price_drop'
                    CHECK (alert_type IN ('price_drop', 'price_spike', 'back_in_stock')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_triggered    BOOLEAN NOT NULL DEFAULT FALSE,
  triggered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = TRUE;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- profiles: users can read/update their own row
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- user_usage: users can read their own row (backend writes via service role)
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_usage_select_own" ON public.user_usage;
CREATE POLICY "user_usage_select_own" ON public.user_usage
  FOR SELECT USING (auth.uid() = user_id);

-- global_cache_products: anyone authenticated can SELECT (free tier access)
ALTER TABLE public.global_cache_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "global_cache_select_all" ON public.global_cache_products;
CREATE POLICY "global_cache_select_all" ON public.global_cache_products
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- saved_products: strict user isolation
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saved_select_own" ON public.saved_products;
CREATE POLICY "saved_select_own" ON public.saved_products
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "saved_insert_own" ON public.saved_products;
CREATE POLICY "saved_insert_own" ON public.saved_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "saved_delete_own" ON public.saved_products;
CREATE POLICY "saved_delete_own" ON public.saved_products
  FOR DELETE USING (auth.uid() = user_id);

-- tracked_products: strict user isolation
ALTER TABLE public.tracked_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tracked_select_own" ON public.tracked_products;
CREATE POLICY "tracked_select_own" ON public.tracked_products
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "tracked_insert_own" ON public.tracked_products;
CREATE POLICY "tracked_insert_own" ON public.tracked_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "tracked_delete_own" ON public.tracked_products;
CREATE POLICY "tracked_delete_own" ON public.tracked_products
  FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "tracked_update_own" ON public.tracked_products;
CREATE POLICY "tracked_update_own" ON public.tracked_products
  FOR UPDATE USING (auth.uid() = user_id);

-- price_history: users can only read their own product history
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "price_history_select_own" ON public.price_history;
CREATE POLICY "price_history_select_own" ON public.price_history
  FOR SELECT USING (auth.uid() = user_id);

-- calculator_presets: strict user isolation
ALTER TABLE public.calculator_presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "presets_select_own" ON public.calculator_presets;
CREATE POLICY "presets_select_own" ON public.calculator_presets
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "presets_insert_own" ON public.calculator_presets;
CREATE POLICY "presets_insert_own" ON public.calculator_presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "presets_update_own" ON public.calculator_presets;
CREATE POLICY "presets_update_own" ON public.calculator_presets
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "presets_delete_own" ON public.calculator_presets;
CREATE POLICY "presets_delete_own" ON public.calculator_presets
  FOR DELETE USING (auth.uid() = user_id);

-- price_alerts: strict user isolation
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "alerts_select_own" ON public.price_alerts;
CREATE POLICY "alerts_select_own" ON public.price_alerts
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "alerts_insert_own" ON public.price_alerts;
CREATE POLICY "alerts_insert_own" ON public.price_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "alerts_update_own" ON public.price_alerts;
CREATE POLICY "alerts_update_own" ON public.price_alerts
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "alerts_delete_own" ON public.price_alerts;
CREATE POLICY "alerts_delete_own" ON public.price_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- HELPER: updated_at auto-trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_user_usage_updated_at ON public.user_usage;
CREATE TRIGGER set_user_usage_updated_at
  BEFORE UPDATE ON public.user_usage
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_tracked_products_updated_at ON public.tracked_products;
CREATE TRIGGER set_tracked_products_updated_at
  BEFORE UPDATE ON public.tracked_products
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_presets_updated_at ON public.calculator_presets;
CREATE TRIGGER set_presets_updated_at
  BEFORE UPDATE ON public.calculator_presets
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- GRANT service_role full access (needed by FastAPI admin client)
-- ============================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
