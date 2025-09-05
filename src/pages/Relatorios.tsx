import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useMovements } from '@/hooks/useMovements';
import { useSuppliers } from '@/hooks/useSuppliers';
import { BarChart3, Download, FileText, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Relatorios() {
  const [reportType, setReportType] = useState<'inventory' | 'movements' | 'suppliers'>('inventory');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Filtros do inventário
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  
  const { products, getLowStockProducts } = useProducts();
  const { movements, getMovementsByDateRange } = useMovements();
  const { suppliers } = useSuppliers();

  const lowStockProducts = getLowStockProducts();
  
  // Obter categorias únicas dos produtos
  const uniqueCategories = Array.from(new Set(products.map(p => p.categoria).filter(Boolean)));
  
  // Função para filtrar produtos do inventário
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.categoria && product.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
    
    const matchesStockStatus = stockStatus === 'all' ||
      (stockStatus === 'low' && product.estoque_atual <= product.estoque_minimo) ||
      (stockStatus === 'normal' && product.estoque_atual > product.estoque_minimo);
    
    return matchesSearch && matchesCategory && matchesStockStatus;
  });
  
  const totalInventoryValue = products.reduce(
    (total, product) => total + (product.estoque_atual * product.preco_custo), 0
  );

  const filteredMovements = startDate && endDate 
    ? getMovementsByDateRange(new Date(startDate), new Date(endDate))
    : movements.slice(0, 100); // Last 100 movements

  const movementsByType = filteredMovements.reduce((acc, movement) => {
    acc[movement.tipo] = (acc[movement.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  const exportInventoryReport = () => {
    const data = filteredProducts.map(product => ({
      SKU: product.sku,
      Nome: product.nome,
      Categoria: product.categoria || '',
      Estoque: product.estoque_atual,
      'Valor Unitário': product.preco_custo,
      'Valor Total': product.estoque_atual * product.preco_custo,
      'Estoque Mínimo': product.estoque_minimo,
      Status: product.estoque_atual <= product.estoque_minimo ? 'Baixo' : 'Normal'
    }));
    
    exportToCsv(data, `inventario-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  const exportMovementsReport = () => {
    const data = filteredMovements.map(movement => ({
      Data: format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm'),
      Produto: products.find(p => p.id === movement.produto_id)?.nome || '',
      SKU: products.find(p => p.id === movement.produto_id)?.sku || '',
      Tipo: movement.tipo,
      Quantidade: movement.quantidade,
      'Estoque Anterior': movement.estoque_anterior,
      'Estoque Posterior': movement.estoque_posterior,
      Usuário: movement.profiles?.nome || '',
      Observação: movement.observacao || ''
    }));
    
    exportToCsv(data, `movimentacoes-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
            <p className="text-muted-foreground">
              Análises e relatórios do seu estoque
            </p>
          </div>

          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory">Inventário</SelectItem>
              <SelectItem value="movements">Movimentações</SelectItem>
              <SelectItem value="suppliers">Fornecedores</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Produtos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor do Inventário
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalInventoryValue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produtos em Baixa
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fornecedores Ativos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suppliers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Report Content */}
        {reportType === 'inventory' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Relatório de Inventário</CardTitle>
                <CardDescription>
                  Visão completa do estoque atual
                </CardDescription>
              </div>
              <Button onClick={exportInventoryReport} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtros */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar</Label>
                  <Input
                    id="search"
                    placeholder="Nome, SKU ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {uniqueCategories.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status do Estoque</Label>
                  <Select value={stockStatus} onValueChange={setStockStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Estoque Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} produto(s) encontrado(s)
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setStockStatus('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono">{product.sku}</TableCell>
                        <TableCell className="font-medium">{product.nome}</TableCell>
                        <TableCell>{product.categoria || '-'}</TableCell>
                        <TableCell>{product.estoque_atual}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(product.preco_custo)}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(product.estoque_atual * product.preco_custo)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.estoque_atual <= product.estoque_minimo ? "destructive" : "default"}
                          >
                            {product.estoque_atual <= product.estoque_minimo ? 'Baixo' : 'Normal'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === 'movements' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Relatório de Movimentações</CardTitle>
                <CardDescription>
                  Histórico de entradas e saídas
                </CardDescription>
              </div>
              <Button onClick={exportMovementsReport} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {movementsByType.entrada || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Entradas</div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {movementsByType.saida || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Saídas</div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {movementsByType.ajuste || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Ajustes</div>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Usuário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.slice(0, 50).map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{products.find(p => p.id === movement.produto_id)?.nome}</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {products.find(p => p.id === movement.produto_id)?.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              movement.tipo === 'entrada' ? 'default' :
                              movement.tipo === 'saida' ? 'destructive' : 'secondary'
                            }
                          >
                            {movement.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{movement.quantidade}</TableCell>
                        <TableCell>{movement.profiles?.nome}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === 'suppliers' && (
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Fornecedores</CardTitle>
              <CardDescription>
                Informações dos fornecedores cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.nome}</TableCell>
                        <TableCell>{supplier.cnpj || '-'}</TableCell>
                        <TableCell>{supplier.contato || '-'}</TableCell>
                        <TableCell>{supplier.telefone || '-'}</TableCell>
                        <TableCell>{supplier.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={supplier.ativo ? "default" : "secondary"}>
                            {supplier.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}