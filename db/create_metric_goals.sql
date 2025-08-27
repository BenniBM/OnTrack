-- Script to create goals for cash, weight, and screentime metrics from weekly reviews
-- This script analyzes the reviews data and creates goals with progress logs

-- Create a temporary table to store the metric data with dates
CREATE TEMP TABLE temp_metrics AS
SELECT 
    created_at::date as review_date,
    cash,
    weight,
    screentime
FROM reviews 
WHERE created_at IS NOT NULL
ORDER BY created_at;

-- Create Cash Goal
INSERT INTO goals (
    id,
    title,
    type,
    start_date,
    end_date,
    current_value,
    start_value,
    end_value,
    target_value,
    subtasks,
    description,
    unit,
    progress_logs,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    'Cash' as title,
    'numerical' as type,
    MIN(review_date) as start_date,
    MAX(review_date) as end_date,
    (SELECT cash FROM temp_metrics WHERE cash > 0 ORDER BY review_date DESC LIMIT 1) as current_value,
    MIN(cash) as start_value,
    MAX(cash) as end_value,
    MAX(cash) as target_value,
    '[]'::jsonb as subtasks,
    'Cash tracking goal based on weekly review cash values' as description,
    '€' as unit,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', gen_random_uuid(),
                'value', cash,
                'timestamp', review_date
            ) ORDER BY review_date
        ) FILTER (WHERE cash > 0),
        '[]'::jsonb
    ) as progress_logs,
    NOW() as created_at,
    NOW() as updated_at
FROM temp_metrics
WHERE cash > 0;

-- Create Weight Goal
INSERT INTO goals (
    id,
    title,
    type,
    start_date,
    end_date,
    current_value,
    start_value,
    end_value,
    target_value,
    subtasks,
    description,
    unit,
    progress_logs,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    'Weight' as title,
    'numerical' as type,
    MIN(review_date) as start_date,
    MAX(review_date) as end_date,
    (SELECT weight FROM temp_metrics WHERE weight > 0 ORDER BY review_date DESC LIMIT 1) as current_value,
    MIN(weight) as start_value,
    MAX(weight) as end_value,
    MAX(weight) as target_value,
    '[]'::jsonb as subtasks,
    'Weight tracking goal based on weekly review weight values' as description,
    'kg' as unit,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', gen_random_uuid(),
                'value', weight,
                'timestamp', review_date
            ) ORDER BY review_date
        ) FILTER (WHERE weight > 0),
        '[]'::jsonb
    ) as progress_logs,
    NOW() as created_at,
    NOW() as updated_at
FROM temp_metrics
WHERE weight > 0;

-- Create Screentime Goal
INSERT INTO goals (
    id,
    title,
    type,
    start_date,
    end_date,
    current_value,
    start_value,
    end_value,
    target_value,
    subtasks,
    description,
    unit,
    progress_logs,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    'Screen Time' as title,
    'numerical' as type,
    MIN(review_date) as start_date,
    MAX(review_date) as end_date,
    (SELECT screentime FROM temp_metrics WHERE screentime > 0 ORDER BY review_date DESC LIMIT 1) as current_value,
    MIN(screentime) as start_value,
    MAX(screentime) as end_value,
    MAX(screentime) as target_value,
    '[]'::jsonb as subtasks,
    'Screen time tracking goal based on weekly review screentime values' as description,
    'h' as unit,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', gen_random_uuid(),
                'value', screentime,
                'timestamp', review_date
            ) ORDER BY review_date
        ) FILTER (WHERE screentime > 0),
        '[]'::jsonb
    ) as progress_logs,
    NOW() as created_at,
    NOW() as updated_at
FROM temp_metrics
WHERE screentime > 0;

-- Clean up temporary table
DROP TABLE temp_metrics;

-- Display the created goals
SELECT 
    title,
    type,
    start_date,
    end_date,
    start_value,
    end_value,
    target_value,
    unit,
    jsonb_array_length(progress_logs) as progress_logs_count
FROM goals 
WHERE title IN ('Cash', 'Weight', 'Screen Time')
ORDER BY title;
