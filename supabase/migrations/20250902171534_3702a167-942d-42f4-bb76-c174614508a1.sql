-- Create enums for user roles and movement types
CREATE TYPE public.user_role AS ENUM ('admin', 'operador', 'visualizador');
CREATE TYPE public.movement_type AS ENUM ('entrada', 'saida', 'ajuste');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  perfil user_role NOT NULL DEFAULT 'visualizador',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fornecedores table
CREATE TABLE public.fornecedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  contato TEXT,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create produtos table
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  unidade TEXT NOT NULL DEFAULT 'unidade',
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  preco_custo DECIMAL(10,2) DEFAULT 0,
  estoque_atual INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 0,
  estoque_maximo INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT estoque_positivo CHECK (estoque_atual >= 0),
  CONSTRAINT estoque_minimo_positivo CHECK (estoque_minimo >= 0),
  CONSTRAINT estoque_maximo_positivo CHECK (estoque_maximo >= 0)
);

-- Create movimentacoes table
CREATE TABLE public.movimentacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  tipo movement_type NOT NULL,
  quantidade INTEGER NOT NULL,
  estoque_anterior INTEGER NOT NULL,
  estoque_posterior INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT quantidade_positiva CHECK (quantidade > 0)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;

-- Create function to get user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS user_role AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT perfil INTO user_role_result
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(user_role_result, 'visualizador'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create function to generate unique SKU
CREATE OR REPLACE FUNCTION public.generate_sku()
RETURNS TEXT AS $$
DECLARE
  new_sku TEXT;
  sku_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate SKU with format: SKU + timestamp + random 4 digits
    new_sku := 'SKU' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if SKU already exists
    SELECT EXISTS(SELECT 1 FROM public.produtos WHERE sku = new_sku) INTO sku_exists;
    
    -- Exit loop if SKU is unique
    IF NOT sku_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_sku;
END;
$$ LANGUAGE plpgsql;

-- Create function to update product stock
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product stock based on movement
  IF NEW.tipo = 'entrada' OR NEW.tipo = 'ajuste' THEN
    UPDATE public.produtos 
    SET estoque_atual = NEW.estoque_posterior,
        updated_at = now()
    WHERE id = NEW.produto_id;
  ELSIF NEW.tipo = 'saida' THEN
    -- Check if there's enough stock
    IF NEW.estoque_anterior < NEW.quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', NEW.estoque_anterior, NEW.quantidade;
    END IF;
    
    UPDATE public.produtos 
    SET estoque_atual = NEW.estoque_posterior,
        updated_at = now()
    WHERE id = NEW.produto_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'visualizador'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- Create RLS Policies for fornecedores
CREATE POLICY "All authenticated users can view fornecedores" ON public.fornecedores
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and operadores can manage fornecedores" ON public.fornecedores
  FOR ALL USING (public.get_user_role() IN ('admin', 'operador'));

-- Create RLS Policies for produtos
CREATE POLICY "All authenticated users can view produtos" ON public.produtos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and operadores can manage produtos" ON public.produtos
  FOR ALL USING (public.get_user_role() IN ('admin', 'operador'));

-- Create RLS Policies for movimentacoes
CREATE POLICY "All authenticated users can view movimentacoes" ON public.movimentacoes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and operadores can create movimentacoes" ON public.movimentacoes
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'operador'));

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fornecedores_updated_at
  BEFORE UPDATE ON public.fornecedores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for stock updates
CREATE TRIGGER update_stock_trigger
  AFTER INSERT ON public.movimentacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();

-- Create trigger to auto-generate SKU
CREATE OR REPLACE FUNCTION public.set_product_sku()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := public.generate_sku();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_sku_trigger
  BEFORE INSERT ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.set_product_sku();

-- Create indexes for better performance
CREATE INDEX idx_produtos_sku ON public.produtos(sku);
CREATE INDEX idx_produtos_fornecedor ON public.produtos(fornecedor_id);
CREATE INDEX idx_movimentacoes_produto ON public.movimentacoes(produto_id);
CREATE INDEX idx_movimentacoes_user ON public.movimentacoes(user_id);
CREATE INDEX idx_movimentacoes_created_at ON public.movimentacoes(created_at);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);