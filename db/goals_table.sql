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

-- Add metric field to distinguish metric goals from regular goals
ALTER TABLE goals ADD COLUMN metric BOOLEAN DEFAULT FALSE;

-- Update the metric goals to set metric = TRUE
UPDATE goals 
SET metric = TRUE 
WHERE title IN ('Cash', 'Weight', 'Screen Time');