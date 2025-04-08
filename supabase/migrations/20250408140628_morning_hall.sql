/*
  # Fix delete policy for vacation requests

  1. Changes
    - Update delete policy to use JWT claims instead of querying auth.users table
*/

-- Drop existing delete policy
DROP POLICY IF EXISTS "Admins can delete requests" ON vacation_requests;

-- Create new delete policy using JWT claims
CREATE POLICY "Admins can delete requests"
  ON vacation_requests
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'email' = 'h.ferreira@retripa.ch') OR
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );
