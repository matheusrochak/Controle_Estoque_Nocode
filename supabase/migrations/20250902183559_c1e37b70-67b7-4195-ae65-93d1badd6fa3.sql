-- Set the user matheus_rochak@live.com as admin
-- First, let's see if the user already exists in auth.users
DO $$
DECLARE
    user_exists UUID;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO user_exists FROM auth.users WHERE email = 'matheus_rochak@live.com' LIMIT 1;
    
    IF user_exists IS NOT NULL THEN
        -- User exists, update or insert profile
        INSERT INTO public.profiles (user_id, nome, perfil)
        VALUES (user_exists, 'Matheus Silva Rocha', 'admin'::user_role)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            perfil = 'admin'::user_role,
            updated_at = now();
        
        RAISE NOTICE 'User % set as admin successfully', user_exists;
    ELSE
        RAISE NOTICE 'User with email matheus_rochak@live.com not found in auth.users';
    END IF;
END $$;