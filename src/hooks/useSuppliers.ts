import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  nome: string;
  cnpj?: string;
  contato?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;

      setSuppliers(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar fornecedores",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .insert([supplierData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Fornecedor criado!",
        description: `${data.nome} foi adicionado com sucesso.`,
      });

      fetchSuppliers();
      return { data, error: null };
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar fornecedor",
        description: err.message,
      });
      return { data: null, error: err };
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from('fornecedores')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Fornecedor atualizado!",
        description: "As informações foram salvas com sucesso.",
      });

      fetchSuppliers();
      return { error: null };
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar fornecedor",
        description: err.message,
      });
      return { error: err };
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fornecedores')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Fornecedor desativado!",
        description: "O fornecedor foi removido da lista ativa.",
      });

      fetchSuppliers();
      return { error: null };
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover fornecedor",
        description: err.message,
      });
      return { error: err };
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers,
  };
}