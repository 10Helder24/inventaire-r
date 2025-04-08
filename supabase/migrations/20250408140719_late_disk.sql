/*
  # Fix vacation requests policies

  1. Changes
    - Remove existing policies that reference the users table
    - Add new policies for admins based on app_metadata and user_metadata
    - Simplify the policy conditions to use JWT claims directly

  2. Security
    - Maintain RLS enabled
    - Update policies to use JWT claims for role checking
    - Ensure admins can manage all requests while users can only manage their own pending requests
*/

-- Drop existing policies that reference the users table
DROP POLICY IF EXISTS "Admins can update any request" ON vacation_requests;

-- Create new policy for admin updates using JWT claims
CREATE POLICY "Admins can update requests" ON vacation_requests
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'email'::text) = 'h.ferreira@retripa.ch'
  OR ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'
  OR ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'email'::text) = 'h.ferreira@retripa.ch'
  OR ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'
  OR ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'
);
