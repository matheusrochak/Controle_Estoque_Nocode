import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSuppliers, type Supplier } from '@/hooks/useSuppliers';
import { Plus, Edit, Trash2, Building2, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function Fornecedores() {
  const { profile } = useAuth();
  const { suppliers, loading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canManage = profile?.perfil === 'admin' || profile?.perfil === 'operador';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const supplierData = {
      nome: formData.get('nome') as string,
      cnpj: formData.get('cnpj') as string || undefined,
      contato: formData.get('contato') as string || undefined,
      telefone: formData.get('telefone') as string || undefined,
      email: formData.get('email') as string || undefined,
      ativo: true,
    };

    if (selectedSupplier) {
      await updateSupplier(selectedSupplier.id, supplierData);
    } else {
      await createSupplier(supplierData);
    }

    setIsDialogOpen(false);
    setSelectedSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (window.confirm(`Deseja realmente remover o fornecedor ${supplier.nome}?`)) {
      await deleteSupplier(supplier.id);
    }
  };

  const openNewDialog = () => {
    setSelectedSupplier(null);
    setIsDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
            <p className="text-muted-foreground">
              Gerencie seus fornecedores e parceiros comerciais
            </p>
          </div>

          {canManage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Fornecedor
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha as informações do fornecedor
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        name="nome"
                        defaultValue={selectedSupplier?.nome}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        name="cnpj"
                        defaultValue={selectedSupplier?.cnpj}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contato">Pessoa de Contato</Label>
                      <Input
                        id="contato"
                        name="contato"
                        defaultValue={selectedSupplier?.contato}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        defaultValue={selectedSupplier?.telefone}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={selectedSupplier?.email}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit">
                      {selectedSupplier ? 'Atualizar' : 'Criar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lista de Fornecedores
            </CardTitle>
            <CardDescription>
              {suppliers.length} fornecedores cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum fornecedor cadastrado
              </div>
            ) : (
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
                      {canManage && <TableHead>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">
                          {supplier.nome}
                        </TableCell>
                        <TableCell>{supplier.cnpj || '-'}</TableCell>
                        <TableCell>{supplier.contato || '-'}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {supplier.telefone && (
                            <>
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {supplier.telefone}
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          {supplier.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {supplier.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={supplier.ativo ? "default" : "secondary"}>
                            {supplier.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(supplier)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(supplier)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}