import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Package } from "lucide-react";

interface ProductFormProps {
  onSubmit: (product: any) => void;
  initialData?: any;
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    sku: initialData?.sku || `SKU${Date.now()}`,
    descricao: initialData?.descricao || "",
    categoria: initialData?.categoria || "",
    unidade: initialData?.unidade || "unidade",
    fornecedor_id: initialData?.fornecedor_id || "",
    preco_custo: initialData?.preco_custo || "",
    estoque_atual: initialData?.estoque_atual || "",
    estoque_minimo: initialData?.estoque_minimo || "",
    estoque_maximo: initialData?.estoque_maximo || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          {initialData ? "Editar Produto" : "Cadastrar Produto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Digite o nome do produto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                placeholder="SKU único do produto"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              placeholder="Descrição detalhada do produto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select onValueChange={(value) => handleChange("categoria", value)} defaultValue={formData.categoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Motor">Motor</SelectItem>
                  <SelectItem value="Transmissão">Transmissão</SelectItem>
                  <SelectItem value="Freios">Freios</SelectItem>
                  <SelectItem value="Suspensão">Suspensão</SelectItem>
                  <SelectItem value="Elétrica">Elétrica</SelectItem>
                  <SelectItem value="Pneus e Rodas">Pneus e Rodas</SelectItem>
                  <SelectItem value="Carroceria">Carroceria</SelectItem>
                  <SelectItem value="Interior">Interior</SelectItem>
                  <SelectItem value="Filtros">Filtros</SelectItem>
                  <SelectItem value="Óleos e Lubrificantes">Óleos e Lubrificantes</SelectItem>
                  <SelectItem value="Acessórios">Acessórios</SelectItem>
                  <SelectItem value="Peças de Caminhão">Peças de Caminhão</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade de Medida</Label>
              <Select onValueChange={(value) => handleChange("unidade", value)} defaultValue={formData.unidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidade">Unidade</SelectItem>
                  <SelectItem value="kg">Quilograma</SelectItem>
                  <SelectItem value="g">Grama</SelectItem>
                  <SelectItem value="l">Litro</SelectItem>
                  <SelectItem value="ml">Mililitro</SelectItem>
                  <SelectItem value="m">Metro</SelectItem>
                  <SelectItem value="cm">Centímetro</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                  <SelectItem value="pacote">Pacote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco_custo">Preço de Custo (R$)</Label>
              <Input
                id="preco_custo"
                type="number"
                value={formData.preco_custo}
                onChange={(e) => handleChange("preco_custo", e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor_id">Fornecedor</Label>
              <Select onValueChange={(value) => handleChange("fornecedor_id", value)} defaultValue={formData.fornecedor_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum fornecedor</SelectItem>
                  {/* Lista de fornecedores será preenchida dinamicamente */}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estoque_atual">Estoque Atual</Label>
              <Input
                id="estoque_atual"
                type="number"
                value={formData.estoque_atual}
                onChange={(e) => handleChange("estoque_atual", e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
              <Input
                id="estoque_minimo"
                type="number"
                value={formData.estoque_minimo}
                onChange={(e) => handleChange("estoque_minimo", e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estoque_maximo">Estoque Máximo</Label>
              <Input
                id="estoque_maximo"
                type="number"
                value={formData.estoque_maximo}
                onChange={(e) => handleChange("estoque_maximo", e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-gradient-primary shadow-soft">
              <Save className="w-4 h-4 mr-2" />
              {initialData ? "Atualizar" : "Cadastrar"} Produto
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}