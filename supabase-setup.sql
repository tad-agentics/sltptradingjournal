-- SLTP Trading Journal - Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  pnl DECIMAL NOT NULL,
  fee DECIMAL NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries by date
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date DESC);

-- Create index for faster queries by created_at
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
-- Note: This is for simplicity. In production with auth, you should restrict by user_id
CREATE POLICY "Allow all operations on trades" ON trades
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify the table was created
SELECT 'Trades table created successfully!' as status;
