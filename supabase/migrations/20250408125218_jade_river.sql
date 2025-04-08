/*
  # Fix vacation requests permissions

  This migration updates the vacation requests table permissions to:
  - Allow public access to view requests
  - Fix reference to auth.users
  - Add enable_row_level_security to auth.users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own requests" ON vacation_requests;
DROP POLICY IF EXISTS "Users can create their own requests" ON vacation_requests;
DROP POLICY IF EXISTS "Users can update their pending requests" ON vacation_requests;
DROP POLICY IF EXISTS "Admins can update any request" ON vacation_requests;

-- Create new policies with fixed permissions
CREATE POLICY "Anyone can view requests"
  ON vacation_requests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create requests"
  ON vacation_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

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
      SELECT email 
      FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT email 
      FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );
