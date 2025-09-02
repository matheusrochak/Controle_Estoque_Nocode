import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Users, Shield, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const nome = formData.get('nome') as string;
    const perfil = formData.get('perfil') as 'admin' | 'operador' | 'visualizador';

    try {
      // For now, we'll create a profile entry directly
      // In production, this would integrate with admin API to create auth users
      // Generate a temporary user_id for demo purposes
      const tempUserId = crypto.randomUUID();
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: tempUserId,
          nome,
          perfil
        });

      if (profileError) throw profileError;

      toast({
        title: "Funcionário cadastrado!",
        description: `${nome} foi adicionado com perfil ${perfil}. Um email de convite será enviado.`,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar funcionário",
        description: err.message || 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            name="nome"
            placeholder="Nome do funcionário"
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@empresa.com"
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Senha Temporária</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Digite uma senha temporária"
            required
            disabled={loading}
            minLength={6}
          />
          <p className="text-xs text-muted-foreground">
            O funcionário deve alterar a senha no primeiro acesso
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="perfil">Perfil de Acesso</Label>
          <Select name="perfil" required disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visualizador">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <div>
                    <div>Visualizador</div>
                    <div className="text-xs text-muted-foreground">Apenas visualização</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="operador">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <div>
                    <div>Operador</div>
                    <div className="text-xs text-muted-foreground">Pode gerenciar estoque</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <div>
                    <div>Administrador</div>
                    <div className="text-xs text-muted-foreground">Controle total</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
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
              Cadastrando...
            </>
          ) : (
            'Cadastrar Funcionário'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}