-- SLTP Trading Journal - Authentication Migration
-- Run this SQL in your Supabase SQL Editor to add user authentication

-- Step 1: Add user_id column to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);

-- Step 3: Drop the old open policy
DROP POLICY IF EXISTS "Allow all operations on trades" ON trades;

-- Step 4: Create new policies that restrict access by user_id

-- Policy: Users can view only their own trades
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own trades
CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own trades
CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own trades
CREATE POLICY "Users can delete own trades" ON trades
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Update existing trades to have a user_id (if any exist)
-- Note: This will fail if you have existing trades without authentication
-- You may need to delete existing test trades first, or assign them to a user

-- Verify the migration
SELECT 'Authentication migration completed successfully!' as status;
SELECT 'Total policies on trades table: ' || count(*)::text as policy_count 
FROM pg_policies 
WHERE tablename = 'trades';
