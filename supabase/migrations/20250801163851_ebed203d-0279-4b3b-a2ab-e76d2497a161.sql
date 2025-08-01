-- Create a stored procedure to create an admin user
CREATE OR REPLACE FUNCTION create_admin_user(admin_email TEXT, admin_password TEXT, admin_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This function should only be used for setting up the initial admin
  -- In production, this would be handled through proper authentication flows
  
  -- Insert into profiles table with admin role
  INSERT INTO profiles (user_id, email, full_name, role) 
  SELECT 
    id,
    admin_email,
    admin_name,
    'admin'
  FROM auth.users 
  WHERE email = admin_email
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    full_name = admin_name;
END;
$$;

-- Ensure we have an admin profile for existing users
DO $$
BEGIN
  -- Update any existing user with the admin email to have admin role
  UPDATE profiles 
  SET role = 'admin'
  WHERE email IN ('admin@moscooltech.com', 'dayotunde25@gmail.com');
END;
$$;