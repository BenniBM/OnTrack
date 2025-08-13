# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be set up

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Navigate to Settings > API
3. Copy your Project URL and anon/public key

## 3. Set Environment Variables

Create a `.env` file in your project root with:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Create the Database Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create the goals table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('task', 'numerical')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_value NUMERIC NOT NULL DEFAULT 0,
    start_value NUMERIC NOT NULL,
    end_value NUMERIC NOT NULL,
    target_value NUMERIC NOT NULL,
    subtasks JSONB DEFAULT '[]',
    description TEXT,
    unit TEXT NOT NULL CHECK (unit IN ('kg', '€', '%', 'km', 'h', 'none')),
    progress_logs JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to access their goals
CREATE POLICY "Users can view own goals" ON goals
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX idx_goals_user_id ON goals(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Drop the existing policy
DROP POLICY "Users can view own goals" ON goals;

-- Create a proper policy for all operations
CREATE POLICY "Users can manage own goals" ON goals
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
```

## 5. Enable Real-time

1. Go to Database > Replication
2. Enable real-time for the `goals` table

## 6. Test the Setup

1. Start your development server
2. The app will automatically authenticate with the static user (benni/bayern08)
3. Try creating a goal to test the database connection

## Notes

-   The app uses a static user account (benni/bay3rn08) for authentication
-   All goals are stored in the Supabase database with real-time updates
-   The app automatically handles authentication on startup
