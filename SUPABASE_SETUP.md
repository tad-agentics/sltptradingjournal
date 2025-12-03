# Supabase Setup Guide

This guide will help you set up Supabase cloud storage for your SLTP Trading Journal.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in"
3. Sign up with GitHub, Google, or email (no credit card required!)

## Step 2: Create a New Project

1. Once logged in, click "New Project"
2. Fill in the project details:
   - **Name**: `sltp-trading-journal` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Select "Free" (includes 500MB database)
3. Click "Create new project"
4. Wait 1-2 minutes for your project to be set up

## Step 3: Create the Trades Table

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy and paste this SQL code:

```sql
-- Create trades table
CREATE TABLE trades (
  id TEXT PRIMARY KEY,
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  pnl DECIMAL NOT NULL,
  fee DECIMAL NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_trades_date ON trades(date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for simplicity)
-- Note: In production, you should use proper authentication
CREATE POLICY "Allow all operations" ON trades
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned"

## Step 4: Get Your API Keys

1. Click on "Settings" (gear icon) in the left sidebar
2. Click on "API" under Project Settings
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 5: Configure Your App

1. In your project folder, create a new file called `.env`:

```bash
# In the terminal, run:
touch .env
```

2. Open `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the values with your actual Project URL and anon key from Step 4.

## Step 6: Restart Your Dev Server

1. Stop your development server (Ctrl+C in the terminal)
2. Start it again:

```bash
npm run dev
```

3. Open your app at http://localhost:5173/
4. You should see a green cloud icon ☁️ next to the title, indicating you're connected!

## Step 7: Deploy to Vercel with Environment Variables

1. Go to your Vercel dashboard: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `sltptradingjournal` project
3. Click "Settings" → "Environment Variables"
4. Add two new variables:
   - **Name**: `VITE_SUPABASE_URL`, **Value**: Your Supabase URL
   - **Name**: `VITE_SUPABASE_ANON_KEY`, **Value**: Your anon key
5. Click "Save"
6. Redeploy your app (go to "Deployments" → click the three dots on the latest deployment → "Redeploy")

## Testing Your Setup

1. **Local**: Open http://localhost:5173/
   - Look for the green cloud icon ☁️ in the header
   - Add a test trade
   - Refresh the page - your trade should still be there!

2. **Production**: Open https://sltptradingjournal.vercel.app/
   - After redeploying with environment variables, you should see the cloud icon
   - Trades added on one device will appear on all devices!

## Troubleshooting

### Yellow cloud icon (CloudOff) appears
- Check that your `.env` file exists and has the correct values
- Make sure you restarted the dev server after creating `.env`
- Verify the environment variables in Vercel settings

### "Error loading trades" in console
- Check the browser console (F12) for error messages
- Verify your Supabase project is active (not paused)
- Confirm the trades table was created correctly

### Trades not syncing
- Make sure you're using the same Supabase project on all devices
- Check that environment variables are set in Vercel
- Clear browser cache and reload

## Data Migration

If you had trades in localStorage before setting up Supabase:
- Don't worry! The app automatically syncs your local trades to Supabase on first load
- After successful sync, local trades are cleared
- All future trades are saved to the cloud

## Security Notes

For this simple app, we're using a public anon key with open policies. This is fine for personal use, but for a production app with multiple users, you should:
- Implement Supabase Authentication
- Add user_id to the trades table
- Update RLS policies to restrict access by user

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Check your browser console for error messages
