import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Movement {
  id: string;
  produto_id: string;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  estoque_anterior: number;
  estoque_posterior: number;
  user_id: string;
  observacao?: string;
  created_at: string;
  produtos: {
    nome: string;
    sku: string;
  };
  profiles: {
    nome: string;
  };
}

export function useMovements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('movimentacoes')
        .select(`
          *,
          produtos (
            nome,
            sku
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMovements((data as any) || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar movimentações",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const createMovement = async (movementData: {
    produto_id: string;
    tipo: 'entrada' | 'saida' | 'ajuste';
    quantidade: number;
    observacao?: string;
  }) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado",
      });
      return { error: new Error("Usuário não autenticado") };
    }

    try {
      // First, get current stock
      const { data: product, error: productError } = await supabase
        .from('produtos')
        .select('estoque_atual')
        .eq('id', movementData.produto_id)
        .single();

      if (productError) throw productError;

      const estoqueAnterior = product.estoque_atual;
      let estoquePosterior = estoqueAnterior;

      // Calculate new stock based on movement type
      switch (movementData.tipo) {
        case 'entrada':
          estoquePosterior = estoqueAnterior + movementData.quantidade;
          break;
        case 'saida':
          estoquePosterior = estoqueAnterior - movementData.quantidade;
          if (estoquePosterior < 0) {
            throw new Error(`Estoque insuficiente. Disponível: ${estoqueAnterior}`);
          }
          break;
        case 'ajuste':
          estoquePosterior = movementData.quantidade;
          break;
      }

      const { data, error } = await supabase
        .from('movimentacoes')
        .insert([{
          ...movementData,
          estoque_anterior: estoqueAnterior,
          estoque_posterior: estoquePosterior,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Movimentação registrada!",
        description: `${movementData.tipo.charAt(0).toUpperCase() + movementData.tipo.slice(1)} de ${movementData.quantidade} unidades`,
      });

      fetchMovements();
      return { data, error: null };
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar movimentação",
        description: err.message,
      });
      return { data: null, error: err };
    }
  };

  const getMovementsByDateRange = (startDate: Date, endDate: Date) => {
    return movements.filter(movement => {
      const movementDate = new Date(movement.created_at);
      return movementDate >= startDate && movementDate <= endDate;
    });
  };

  const getMovementsByProduct = (productId: string) => {
    return movements.filter(movement => movement.produto_id === productId);
  };

  const getTodaysMovements = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return getMovementsByDateRange(today, tomorrow);
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return {
    movements,
    loading,
    error,
    createMovement,
    getMovementsByDateRange,
    getMovementsByProduct,
    getTodaysMovements,
    refetch: fetchMovements,
  };
}