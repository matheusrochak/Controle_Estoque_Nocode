-- Fix the relationship between movimentacoes and profiles
-- Both tables reference auth.users through user_id, so we need to ensure proper foreign keys

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
  -- Check if foreign key constraint already exists for movimentacoes.user_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'movimentacoes_user_id_fkey' 
    AND table_name = 'movimentacoes'
  ) THEN
    -- Add foreign key constraint to movimentacoes.user_id -> auth.users.id
    ALTER TABLE public.movimentacoes 
    ADD CONSTRAINT movimentacoes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Check if foreign key constraint already exists for profiles.user_id  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    -- Add foreign key constraint to profiles.user_id -> auth.users.id
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;