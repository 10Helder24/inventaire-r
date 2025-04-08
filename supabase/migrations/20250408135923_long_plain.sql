/*
  # Set admin role in user metadata

  1. Changes
    - Update raw_user_meta_data to include admin role
    - Use proper column name and JSON operations
*/

-- Update user metadata to include admin role
UPDATE auth.users
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN 
      jsonb_build_object('role', 'admin')
    ELSE 
      raw_user_meta_data || jsonb_build_object('role', 'admin')
  END
WHERE email = '${user.email}';
