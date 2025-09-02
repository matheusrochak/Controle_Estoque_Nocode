import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductForm } from "@/components/products/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Eye, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Produtos() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - will be replaced with real data from backend
  const [products] = useState([
    {
      id: 1,
      nome: "Notebook Dell Inspiron",
      sku: "DELL001",
      categoria: "Eletrônicos",
      estoque: 15,
      estoqueMinimo: 5,
      precoCusto: 2500.00,
      precoVenda: 3200.00,
      unidade: "un"
    },
    {
      id: 2,
      nome: "Mouse Logitech MX",
      sku: "LOG001",
      categoria: "Eletrônicos",
      estoque: 3,
      estoqueMinimo: 10,
      precoCusto: 180.00,
      precoVenda: 250.00,
      unidade: "un"
    },
    {
      id: 3,
      nome: "Teclado Mecânico RGB",
      sku: "TECA001",
      categoria: "Eletrônicos",
      estoque: 8,
      estoqueMinimo: 5,
      precoCusto: 320.00,
      precoVenda: 450.00,
      unidade: "un"
    }
  ]);

  const handleAddProduct = (productData: any) => {
    console.log("Novo produto:", productData);
    toast({
      title: "Produto cadastrado!",
      description: "O produto foi cadastrado com sucesso.",
    });
    setShowForm(false);
  };

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (estoque: number, estoqueMinimo: number) => {
    if (estoque <= estoqueMinimo) {
      return { label: "Baixo", variant: "destructive" as const };
    }
    if (estoque <= estoqueMinimo * 1.5) {
      return { label: "Médio", variant: "secondary" as const };
    }
    return { label: "Normal", variant: "default" as const };
  };

  if (showForm) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cadastrar Produto</h1>
              <p className="text-muted-foreground">Adicione um novo produto ao estoque</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Voltar à Lista
            </Button>
          </div>
          
          <ProductForm onSubmit={handleAddProduct} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-primary shadow-soft"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {products.filter(p => p.estoque <= p.estoqueMinimo).length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total do Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                R$ {products.reduce((acc, p) => acc + (p.estoque * p.precoCusto), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar produtos por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Products Table */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.estoque, product.estoqueMinimo);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.nome}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>{product.categoria}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.estoque <= product.estoqueMinimo && (
                            <AlertTriangle className="w-4 h-4 text-warning" />
                          )}
                          {product.estoque} {product.unidade}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Venda: R$ {product.precoVenda.toFixed(2)}</div>
                          <div className="text-muted-foreground">
                            Custo: R$ {product.precoCusto.toFixed(2)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
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