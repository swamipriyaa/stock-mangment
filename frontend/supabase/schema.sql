-- Table 1: stocks_current
CREATE TABLE IF NOT EXISTS stocks_current (
  symbol TEXT PRIMARY KEY,
  price DECIMAL(12,4) NOT NULL,
  change DECIMAL(10,4),
  change_percent DECIMAL(8,4),
  currency TEXT DEFAULT 'USD',
  market_time TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: stocks_history
CREATE TABLE IF NOT EXISTS stocks_history (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  price DECIMAL(12,4) NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_history_symbol_time 
  ON stocks_history(symbol, captured_at DESC);

-- Table 3: watchlists
CREATE TABLE IF NOT EXISTS watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);

-- Table 4: portfolio_holdings
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  quantity DECIMAL(18,8) NOT NULL,
  buy_price DECIMAL(12,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio_holdings(user_id);

-- Table 5: alerts
CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  target_price DECIMAL(12,4) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('ABOVE', 'BELOW')),
  is_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_symbol_active ON alerts(symbol, is_triggered);
