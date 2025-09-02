import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Settings, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useMovements } from '@/hooks/useMovements';
import { useAuth } from '@/contexts/AuthContext';

interface MovementFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function MovementForm({ onSuccess, onCancel }: MovementFormProps) {
  const [loading, setLoading] = useState(false);
  const { products } = useProducts();
  const { createMovement } = useMovements();
  const { profile } = useAuth();

  const canCreateMovements = profile?.perfil === 'admin' || profile?.perfil === 'operador';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canCreateMovements) return;
    
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const produto_id = formData.get('produto_id') as string;
    const tipo = formData.get('tipo') as 'entrada' | 'saida' | 'ajuste';
    const quantidade = parseInt(formData.get('quantidade') as string);
    const observacao = formData.get('observacao') as string;

    try {
      const result = await createMovement({
        produto_id,
        tipo,
        quantidade,
        observacao: observacao || undefined,
      });

      if (result.error) {
        throw result.error;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Erro ao criar movimentação:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!canCreateMovements) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Apenas administradores e operadores podem registrar movimentações
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="produto_id">Produto</Label>
          <Select name="produto_id" required disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex flex-col">
                    <div className="font-medium">{product.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.sku} - Estoque: {product.estoque_atual} {product.unidade}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Movimentação</Label>
          <Select name="tipo" required disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <div>
                    <div>Entrada</div>
                    <div className="text-xs text-muted-foreground">Adicionar ao estoque</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="saida">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <div>
                    <div>Saída</div>
                    <div className="text-xs text-muted-foreground">Retirar do estoque</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="ajuste">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-warning" />
                  <div>
                    <div>Ajuste</div>
                    <div className="text-xs text-muted-foreground">Corrigir estoque</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade</Label>
          <Input
            id="quantidade"
            name="quantidade"
            type="number"
            min="1"
            placeholder="Digite a quantidade"
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="observacao">Observação (opcional)</Label>
          <Textarea
            id="observacao"
            name="observacao"
            placeholder="Motivo da movimentação, fornecedor, etc..."
            disabled={loading}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            'Registrar Movimentação'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}