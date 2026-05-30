import { useState, useEffect } from "react";
import { Layout } from "./Layout";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Usuario } from "../types";
import { Mail, Plus, Edit2, Trash2, UserPlus, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { userApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("");

  // identifica se o usuário no modal é o próprio admin logado
  const isEditingSelf = editingUserId && users.find(u => u.id === editingUserId)?.email === currentUser?.email;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.listarTodos();
      setUsers(data);
    } catch (error) {
      toast.error("erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: Usuario) => {
    if (user) {
      setEditingUserId(user.id);
      setNome(user.nome);
      setEmail(user.email);
      setPerfil(user.perfil);
      setSenha("");
    } else {
      setEditingUserId(null);
      setNome("");
      setEmail("");
      setPerfil("");
      setSenha("");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !email || !perfil || (!editingUserId && !senha)) {
      toast.error("preencha os campos obrigatórios");
      return;
    }

    try {
      const body = { 
        nome, 
        email, 
        perfil: perfil,
        ...(senha ? { senha } : {})
      };

      if (editingUserId) {
        await userApi.atualizarDados(editingUserId, body);
        toast.success("usuário atualizado");
      } else {
        await userApi.registrarFuncionario(body);
        toast.success("usuário cadastrado");
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "erro ao salvar");
    }
  };

  const handleDelete = async (id: string, userEmail: string) => {
    if (currentUser?.email === userEmail) {
      toast.error("você não pode excluir seu próprio perfil");
      return;
    }

    if (!confirm("deseja realmente excluir este usuário?")) return;

    try {
      await userApi.revogarAcesso(id);
      toast.success("usuário excluído");
      fetchUsers();
    } catch (error) {
      toast.error("erro ao excluir");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Usuários</h1>
            <p className="text-slate-500">listagem e cadastro de funcionários</p>
          </div>
          <Button 
            onClick={() => handleOpenModal()}
            className="rounded-xl shadow-lg shadow-primary/20 h-12 px-6 font-bold gap-2"
          >
              <Plus className="w-5 h-5" /> Novo Funcionário
          </Button>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[450px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-900">
                <UserPlus className="w-5 h-5 text-primary" />
                {editingUserId ? "Editar Funcionário" : "Cadastrar Funcionário"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Nome Completo</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} className="h-11 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">
                    {editingUserId ? "Nova Senha (deixe em branco para manter)" : "Senha Inicial"}
                </Label>
                <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="h-11 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">
                    Perfil {isEditingSelf && <span className="text-[10px] lowercase text-amber-600">(não é possível alterar seu próprio nível de acesso)</span>}
                </Label>
                <Select value={perfil} onValueChange={setPerfil} disabled={!!isEditingSelf}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="SOLICITANTE">Solicitante</SelectItem>
                    <SelectItem value="APROVADOR">Aprovador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl flex-1">Cancelar</Button>
                <Button type="submit" className="rounded-xl flex-1">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium">carregando usuários...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
                <Card key={u.id} className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary font-black text-xl">
                                {u.nome.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg leading-tight">{u.nome}</h3>
                                <Badge variant="secondary" className="mt-1 uppercase text-[10px]">
                                    {u.perfil}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span>{u.email}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-slate-50">
                            <Button 
                                variant="outline" 
                                onClick={() => handleOpenModal(u)}
                                className="flex-1 rounded-xl h-10 text-xs font-bold"
                            >
                                <Edit2 className="w-3.5 h-3.5 mr-2" /> Editar
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              onClick={() => handleDelete(u.id, u.email)}
                              className="rounded-xl h-10 text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={currentUser?.email === u.email}
                              title={currentUser?.email === u.email ? "você não pode excluir seu próprio perfil" : ""}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
