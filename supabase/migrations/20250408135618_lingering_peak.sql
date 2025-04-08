/*
  # Add admin role to user

  1. Changes
    - Update user metadata to add admin role
*/

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'admin')
WHERE email = '${user.email}';
