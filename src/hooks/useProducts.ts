import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  sku: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  unidade: string;
  fornecedor_id?: string;
  preco_custo: number;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  fornecedores?: {
    nome: string;
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          fornecedores (
            nome
          )
        `)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'sku' | 'created_at' | 'updated_at' | 'fornecedores'>) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert(productData as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Produto criado!",
        description: `SKU: ${data.sku}`,
      });

      fetchProducts();
      return { data, error: null };
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar produto",
        description: err.message,
      });
      return { data: null, error: err };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Produto atualizado!",
        description: "As informações foram salvas com sucesso.",
      });

      fetchProducts();
      return { error: null };
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar produto",
        description: err.message,
      });
      return { error: err };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Produto desativado!",
        description: "O produto foi removido da lista ativa.",
      });

      fetchProducts();
      return { error: null };
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover produto",
        description: err.message,
      });
      return { error: err };
    }
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.estoque_atual <= product.estoque_minimo);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    refetch: fetchProducts,
  };
}