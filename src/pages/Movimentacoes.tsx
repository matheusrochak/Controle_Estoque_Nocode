import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, TrendingUp, TrendingDown, Package } from "lucide-react";

export default function Movimentacoes() {
  // Mock data - will be replaced with real data from backend
  const movements = [
    {
      id: 1,
      produto: "Notebook Dell Inspiron",
      sku: "DELL001",
      tipo: "entrada",
      quantidade: 10,
      motivo: "Compra fornecedor",
      usuario: "Admin",
      data: "2024-01-15T10:30:00",
      valorUnitario: 2500.00
    },
    {
      id: 2,
      produto: "Mouse Logitech MX",
      sku: "LOG001",
      tipo: "saida",
      quantidade: 2,
      motivo: "Venda",
      usuario: "João Silva",
      data: "2024-01-15T14:20:00",
      valorUnitario: 250.00
    },
    {
      id: 3,
      produto: "Teclado Mecânico RGB",
      sku: "TECA001",
      tipo: "entrada",
      quantidade: 5,
      motivo: "Devolução cliente",
      usuario: "Maria Santos",
      data: "2024-01-14T16:45:00",
      valorUnitario: 450.00
    },
    {
      id: 4,
      produto: "Notebook Dell Inspiron",
      sku: "DELL001",
      tipo: "saida",
      quantidade: 1,
      motivo: "Venda",
      usuario: "Pedro Costa",
      data: "2024-01-14T11:15:00",
      valorUnitario: 3200.00
    },
    {
      id: 5,
      produto: "Mouse Logitech MX",
      sku: "LOG001",
      tipo: "entrada",
      quantidade: 15,
      motivo: "Compra fornecedor",
      usuario: "Admin",
      data: "2024-01-13T09:00:00",
      valorUnitario: 180.00
    }
  ];

  const getTotalMovements = (tipo: 'entrada' | 'saida') => {
    return movements
      .filter(m => m.tipo === tipo)
      .reduce((acc, m) => acc + m.quantidade, 0);
  };

  const getTotalValue = (tipo: 'entrada' | 'saida') => {
    return movements
      .filter(m => m.tipo === tipo)
      .reduce((acc, m) => acc + (m.quantidade * m.valorUnitario), 0);
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
          <Button className="bg-gradient-primary shadow-soft">
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => {
                  const { date, time } = formatDate(movement.data);
                  const total = movement.quantidade * movement.valorUnitario;
                  
                  return (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{date}</div>
                          <div className="text-muted-foreground">{time}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {movement.produto}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {movement.sku}
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
                        R$ {movement.valorUnitario.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-bold">
                        <span className={movement.tipo === 'entrada' ? 'text-success' : 'text-destructive'}>
                          R$ {total.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>{movement.motivo}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {movement.usuario}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}