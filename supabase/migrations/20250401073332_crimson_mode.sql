/*
  # Add category field to articles table

  1. Changes
    - Add category column to articles table
    - Update existing articles to have a default category
*/

ALTER TABLE articles
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Non catégorisé';

-- Add an index on the category column for better performance
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);