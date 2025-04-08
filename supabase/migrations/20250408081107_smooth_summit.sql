/*
  # Add monthly inventory tracking functionality

  1. Changes
    - Add function to extract year and month from date
    - Add trigger to handle monthly inventory updates
    - Add function to handle upserts based on month/year
*/

-- Drop existing objects if they exist to avoid conflicts
DROP TRIGGER IF EXISTS inventory_sheet_upsert ON inventory_sheets;
DROP FUNCTION IF EXISTS handle_inventory_sheet_upsert();
DROP FUNCTION IF EXISTS get_year_month(date);
DROP INDEX IF EXISTS unique_month_year_idx;

-- Create immutable function for year-month extraction
CREATE OR REPLACE FUNCTION get_year_month(date_value date)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT to_char($1, 'YYYY-MM');
$$;

-- Create function to handle upsert
CREATE OR REPLACE FUNCTION handle_inventory_sheet_upsert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Try to update existing record for the same month/year and user
    UPDATE inventory_sheets
    SET 
        data = NEW.data,
        date = NEW.date,
        verified_by = NEW.verified_by,
        updated_at = now()
    WHERE 
        created_by = NEW.created_by 
        AND get_year_month(date) = get_year_month(NEW.date);
    
    -- If no update was made (no matching record found), keep the new record
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- If we updated an existing record, don't insert the new one
    RETURN NULL;
END;
$$;

-- Create trigger for upsert behavior
CREATE TRIGGER inventory_sheet_upsert
    BEFORE INSERT ON inventory_sheets
    FOR EACH ROW
    EXECUTE FUNCTION handle_inventory_sheet_upsert();

-- Create index for efficient lookups
-- Note: We create this last to ensure no conflicts with existing data
CREATE INDEX idx_inventory_sheets_month_year 
ON inventory_sheets (created_by, (get_year_month(date)));

-- Clean up any duplicate records that might exist
WITH ranked_sheets AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY created_by, get_year_month(date)
            ORDER BY updated_at DESC
        ) as rn
    FROM inventory_sheets
)
DELETE FROM inventory_sheets
WHERE id IN (
    SELECT id 
    FROM ranked_sheets 
    WHERE rn > 1
);
