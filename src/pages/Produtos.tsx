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
import { useProducts } from "@/hooks/useProducts";

export default function Produtos() {
  const { toast } = useToast();
  const { products: produtos, loading, createProduct: addProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddProduct = async (productData: any) => {
    try {
      // Converter campos numéricos para os tipos corretos
      const processedData = {
        ...productData,
        preco_custo: productData.preco_custo ? parseFloat(productData.preco_custo) : 0,
        estoque_atual: parseInt(productData.estoque_atual) || 0,
        estoque_minimo: parseInt(productData.estoque_minimo) || 0,
        estoque_maximo: parseInt(productData.estoque_maximo) || 0,
        fornecedor_id: productData.fornecedor_id && productData.fornecedor_id !== "none" ? productData.fornecedor_id : null,
      };

      await addProduct(processedData);
      toast({
        title: "Produto cadastrado!",
        description: "O produto foi cadastrado com sucesso.",
      });
      setShowForm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar produto",
        description: "Verifique os dados e tente novamente.",
      });
    }
  };

  const filteredProducts = produtos.filter(product =>
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
              <div className="text-2xl font-bold">{produtos.length}</div>
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
                {produtos.filter(p => p.estoque_atual <= p.estoque_minimo).length}
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
                R$ {produtos.reduce((acc, p) => acc + (p.estoque_atual * (p.preco_custo || 0)), 0).toLocaleString()}
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
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
                    const stockStatus = getStockStatus(product.estoque_atual, product.estoque_minimo);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.nome}</TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>{product.categoria || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.estoque_atual <= product.estoque_minimo && (
                              <AlertTriangle className="w-4 h-4 text-warning" />
                            )}
                            {product.estoque_atual} {product.unidade}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-muted-foreground">
                              Custo: R$ {product.preco_custo?.toFixed(2) || '0.00'}
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
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}