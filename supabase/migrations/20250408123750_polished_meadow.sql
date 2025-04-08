/*
  # Create vacation management system tables

  1. New Tables
    - `vacation_requests`
      - `id` (uuid, primary key)
      - `user_email` (text, employee email)
      - `start_date` (date, vacation start)
      - `end_date` (date, vacation end)
      - `type` (text, type of absence: vacation, sick, training, etc.)
      - `status` (text, request status: pending, approved, rejected)
      - `comment` (text, optional comment)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `approved_by` (text, admin who approved/rejected)
      - `approved_at` (timestamp)

  2. Security
    - Enable RLS on `vacation_requests` table
    - Add policies for users and admins
*/

-- Create enum for request types
CREATE TYPE absence_type AS ENUM (
  'vacation', -- Vacances
  'sick_leave', -- Maladie
  'training', -- Cours / Formation
  'overtime', -- Heures Sup.
  'bereavement', -- Congé décès
  'accident' -- Accident
);

-- Create enum for request status
CREATE TYPE request_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- Create vacation requests table
CREATE TABLE vacation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  type absence_type NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_by text,
  approved_at timestamptz,

  -- Add constraint to ensure end_date is after or equal to start_date
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own requests"
  ON vacation_requests
  FOR SELECT
  TO authenticated
  USING (
    user_email = auth.jwt() ->> 'email'
    OR
    auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create their own requests"
  ON vacation_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their pending requests"
  ON vacation_requests
  FOR UPDATE
  TO authenticated
  USING (
    user_email = auth.jwt() ->> 'email'
    AND status = 'pending'
  )
  WITH CHECK (
    user_email = auth.jwt() ->> 'email'
    AND status = 'pending'
  );

CREATE POLICY "Admins can update any request"
  ON vacation_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_vacation_requests_user ON vacation_requests(user_email);
CREATE INDEX idx_vacation_requests_dates ON vacation_requests(start_date, end_date);
CREATE INDEX idx_vacation_requests_status ON vacation_requests(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_vacation_requests_updated_at
    BEFORE UPDATE ON vacation_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
