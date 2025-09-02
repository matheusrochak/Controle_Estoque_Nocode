import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, AlertTriangle, ShoppingCart, Plus, FileText } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useMovements } from "@/hooks/useMovements";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { products: produtos, loading: productsLoading } = useProducts();
  const { movements: movimentacoes, loading: movementsLoading } = useMovements();

  const totalProducts = produtos.length;
  const lowStockProducts = produtos.filter(p => p.estoque_atual <= p.estoque_minimo).length;
  const totalValue = produtos.reduce((acc, p) => acc + (p.estoque_atual * (p.preco_custo || 0)), 0);
  
  // Recent movements (today)
  const today = new Date().toISOString().split('T')[0];
  const todayMovements = movimentacoes.filter(mov => 
    mov.created_at.startsWith(today)
  ).length;

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
            <Button 
              className="bg-gradient-primary shadow-soft"
              onClick={() => navigate('/produtos')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/relatorios')}
            >
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
            value={todayMovements.toString()}
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
                {productsLoading ? (
                  <div className="text-center text-muted-foreground py-4">
                    Carregando produtos...
                  </div>
                ) : (
                  produtos
                    .filter(p => p.estoque_atual <= p.estoque_minimo)
                    .map(product => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-warning-light rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{product.nome}</p>
                          <p className="text-sm text-muted-foreground">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-warning">{product.estoque_atual} {product.unidade}</p>
                          <p className="text-xs text-muted-foreground">Min: {product.estoque_minimo}</p>
                        </div>
                      </div>
                    ))
                )}
                {!productsLoading && produtos.filter(p => p.estoque_atual <= p.estoque_minimo).length === 0 && (
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
                {movementsLoading ? (
                  <div className="text-center text-muted-foreground py-4">
                    Carregando movimentações...
                  </div>
                ) : (
                  movimentacoes.slice(0, 5).map(movement => {
                    const produto = produtos.find(p => p.id === movement.produto_id);
                    return (
                      <div key={movement.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{produto?.nome || 'Produto não encontrado'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                          </p>
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
                    );
                  })
                )}
                {!movementsLoading && movimentacoes.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma movimentação recente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
