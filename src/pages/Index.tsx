import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, AlertTriangle, ShoppingCart, Plus, FileText } from "lucide-react";

const Index = () => {
  // Mock data - will be replaced with real data from backend
  const mockProducts = [
    { id: 1, nome: "Notebook Dell", sku: "DELL001", estoque: 15, estoqueMinimo: 5, categoria: "Eletrônicos" },
    { id: 2, nome: "Mouse Logitech", sku: "LOG001", estoque: 3, estoqueMinimo: 10, categoria: "Eletrônicos" },
    { id: 3, nome: "Teclado Mecânico", sku: "TECA001", estoque: 8, estoqueMinimo: 5, categoria: "Eletrônicos" },
  ];

  const mockMovements = [
    { id: 1, produto: "Notebook Dell", tipo: "entrada", quantidade: 5, data: "2024-01-15" },
    { id: 2, produto: "Mouse Logitech", tipo: "saida", quantidade: 2, data: "2024-01-14" },
    { id: 3, produto: "Teclado Mecânico", tipo: "entrada", quantidade: 3, data: "2024-01-13" },
  ];

  const totalProducts = mockProducts.length;
  const lowStockProducts = mockProducts.filter(p => p.estoque <= p.estoqueMinimo).length;
  const totalValue = mockProducts.reduce((acc, p) => acc + p.estoque * 100, 0); // Mock calculation

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do seu estoque</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-gradient-primary shadow-soft">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Relatório
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Produtos"
            value={totalProducts}
            icon={<Package className="w-5 h-5" />}
            trend={{ value: 12, isPositive: true }}
          />
          
          <StatsCard
            title="Valor Total do Estoque"
            value={`R$ ${totalValue.toLocaleString()}`}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="success"
            trend={{ value: 8, isPositive: true }}
          />
          
          <StatsCard
            title="Produtos com Estoque Baixo"
            value={lowStockProducts}
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="warning"
          />
          
          <StatsCard
            title="Movimentações Hoje"
            value="12"
            icon={<ShoppingCart className="w-5 h-5" />}
            trend={{ value: 5, isPositive: false }}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Products */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProducts
                  .filter(p => p.estoque <= p.estoqueMinimo)
                  .map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-warning-light rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{product.nome}</p>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-warning">{product.estoque} un</p>
                        <p className="text-xs text-muted-foreground">Min: {product.estoqueMinimo}</p>
                      </div>
                    </div>
                  ))}
                {mockProducts.filter(p => p.estoque <= p.estoqueMinimo).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Todos os produtos estão com estoque adequado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Movements */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Movimentações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMovements.map(movement => (
                  <div key={movement.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{movement.produto}</p>
                      <p className="text-sm text-muted-foreground">{movement.data}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        movement.tipo === 'entrada' ? 'text-success' : 'text-destructive'
                      }`}>
                        {movement.tipo === 'entrada' ? '+' : '-'}{movement.quantidade}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{movement.tipo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
