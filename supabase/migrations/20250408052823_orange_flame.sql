/*
  # Create inventory sheets table

  1. New Tables
    - `inventory_sheets`
      - `id` (uuid, primary key)
      - `date` (date, inventory date)
      - `data` (jsonb, inventory data)
      - `created_by` (text, user who created the sheet)
      - `verified_by` (text, user who verified the sheet)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `inventory_sheets` table
    - Add policies for authenticated users
*/

CREATE TABLE inventory_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  data jsonb NOT NULL,
  created_by text NOT NULL,
  verified_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON inventory_sheets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON inventory_sheets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
  ON inventory_sheets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
  ON inventory_sheets FOR DELETE
  TO authenticated
  USING (true);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_sheets_updated_at
    BEFORE UPDATE ON inventory_sheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
