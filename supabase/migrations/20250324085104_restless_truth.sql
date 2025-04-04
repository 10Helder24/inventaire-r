/*
  # Create articles table for inventory management

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `code` (text, barcode)
      - `name` (text, article name)
      - `reference` (text, article reference)
      - `stock` (integer, current stock)
      - `unit` (text, unit of measure)
      - `location` (text, storage location)
      - `status` (text, new or synchronized)
      - `comments` (text, article comments)
      - `designation2` (text, optional)
      - `designation3` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `articles` table
    - Add policies for authenticated users to perform CRUD operations
*/

CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text,
  name text NOT NULL,
  reference text,
  stock integer DEFAULT 0,
  unit text,
  location text,
  status text DEFAULT 'new',
  comments text,
  designation2 text,
  designation3 text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read articles"
  ON articles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete articles"
  ON articles
  FOR DELETE
  TO authenticated
  USING (true);