/*
  # Set admin role for specific user

  1. Changes
    - Update user metadata to set admin role for specific email
    - Ensure proper role assignment in raw_user_meta_data
*/

UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'h.ferreira@retripa.ch';
