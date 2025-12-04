-- SLTP Trading Journal - User Settings Migration
-- Run this SQL in your Supabase SQL Editor to enable settings sync across devices

-- Step 1: Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  beginning_balance DECIMAL NOT NULL DEFAULT 10000,
  daily_target_r DECIMAL NOT NULL DEFAULT 2.0,
  sl_budget_r DECIMAL NOT NULL DEFAULT 1.0,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  pairs JSONB NOT NULL DEFAULT '["BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD"]',
  challenge JSONB NOT NULL DEFAULT '{"enabled": false, "targetBalance": 0, "durationDays": 0, "startDate": null, "startingBalance": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies that restrict access by user_id

-- Policy: Users can view only their own settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the migration
SELECT 'User settings table created successfully!' as status;
SELECT 'Total policies on user_settings table: ' || count(*)::text as policy_count 
FROM pg_policies 
WHERE tablename = 'user_settings';

