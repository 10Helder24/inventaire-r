/*
  # Add name field to vacation requests

  1. Changes
    - Add name column to vacation_requests table
*/

ALTER TABLE vacation_requests
ADD COLUMN IF NOT EXISTS name text;
