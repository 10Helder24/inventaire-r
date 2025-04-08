/*
  # Add delete policy for vacation requests

  1. Changes
    - Add policy to allow admins to delete vacation requests
*/

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Admins can delete requests" ON vacation_requests;

-- Create new delete policy for admins
CREATE POLICY "Admins can delete requests"
  ON vacation_requests
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email 
      FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );
