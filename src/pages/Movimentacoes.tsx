import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, TrendingUp, TrendingDown, Package, Info } from "lucide-react";
import { useMovements } from "@/hooks/useMovements";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { MovementForm } from "@/components/movements/MovementForm";

export default function Movimentacoes() {
  const { movements: movimentacoes = [], loading } = useMovements();
  const { products: produtos = [] } = useProducts();
  const { profile } = useAuth();
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  
  const canCreateMovements = profile?.perfil === 'admin' || profile?.perfil === 'operador';

  const getTotalMovements = (tipo: 'entrada' | 'saida') => {
    return movimentacoes
      ?.filter(m => m.tipo === tipo)
      ?.reduce((acc, m) => acc + m.quantidade, 0) || 0;
  };

  const getTotalValue = (tipo: 'entrada' | 'saida') => {
    return movimentacoes
      ?.filter(m => m.tipo === tipo)
      ?.reduce((acc, m) => {
        const produto = produtos?.find(p => p.id === m.produto_id);
        return acc + (m.quantidade * (produto?.preco_custo || 0));
      }, 0) || 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Movimentações</h1>
            <p className="text-muted-foreground">Histórico de entradas e saídas do estoque</p>
          </div>
          {canCreateMovements ? (
            <Button 
              className="bg-gradient-primary shadow-soft"
              onClick={() => setIsMovementDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
          ) : (
            <Badge variant="secondary" className="px-4 py-2">
              <Info className="w-4 h-4 mr-2" />
              Apenas visualização
            </Badge>
          )}
        </div>

        {/* Permission Info */}
        {!canCreateMovements && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Seu perfil <strong>{profile?.perfil}</strong> permite apenas visualizar as movimentações. 
              Para registrar movimentações, entre em contato com um administrador.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-soft border-success/20 bg-success-light/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                Total de Entradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {getTotalMovements('entrada')} un
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                Total de Saídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {getTotalMovements('saida')} un
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Entradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                R$ {getTotalValue('entrada').toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Saídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                R$ {getTotalValue('saida').toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movements Table */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Histórico de Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Observação</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {movimentacoes?.map((movement) => {
                    const { date, time } = formatDate(movement.created_at);
                    const produto = produtos?.find(p => p.id === movement.produto_id);
                    
                    return (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{date}</div>
                            <div className="text-muted-foreground">{time}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div>{produto?.nome || 'Produto não encontrado'}</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {produto?.sku || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={movement.tipo === 'entrada' ? 'default' : 'destructive'}
                            className={movement.tipo === 'entrada' ? 'bg-success text-success-foreground' : ''}
                          >
                            <div className="flex items-center gap-1">
                              {movement.tipo === 'entrada' ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {movement.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">
                          <span className={movement.tipo === 'entrada' ? 'text-success' : 'text-destructive'}>
                            {movement.tipo === 'entrada' ? '+' : '-'}{movement.quantidade}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{movement.profiles?.nome || 'Usuário não encontrado'}</div>
                            <div className="text-muted-foreground text-xs">ID: {movement.user_id.slice(0, 8)}...</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {movement.observacao || 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  }) || []}
                  {(movimentacoes?.length || 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhuma movimentação encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Movement Dialog */}
        <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Movimentação</DialogTitle>
              <DialogDescription>
                Registre uma entrada, saída ou ajuste de estoque
              </DialogDescription>
            </DialogHeader>
            
            <MovementForm 
              onSuccess={() => setIsMovementDialogOpen(false)}
              onCancel={() => setIsMovementDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}