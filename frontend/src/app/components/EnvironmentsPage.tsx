import { Layout } from "./Layout";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, Plus, Edit2, Info, Loader2, X, Trash2, ClipboardType, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { environmentApi } from "../lib/api";
import { Ambiente } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Switch } from "./ui/switch";
import { toast } from "sonner";

export function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Ambiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [apenasAtivos, setApenasAtivos] = useState(true);
  
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nomeSala: "",
    capacidade: 0,
    categoria: "Teórica",
    exclusivoCurso: "",
    observacoes: "",
    recursos: [] as string[],
  });

  const [recursoInput, setRecursoInput] = useState("");

  useEffect(() => {
    loadData();
  }, [apenasAtivos]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await environmentApi.listarTodos(apenasAtivos);
      setEnvironments(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do servidor.");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      nomeSala: "",
      capacidade: 0,
      categoria: "Teórica",
      exclusivoCurso: "",
      observacoes: "",
      recursos: [],
    });
    setIsEnvModalOpen(true);
  };

  const handleOpenEdit = (env: Ambiente) => {
    setEditingId(env.idAmbiente);
    setFormData({
      nomeSala: env.nomeSala,
      capacidade: env.capacidade,
      categoria: env.categoria,
      exclusivoCurso: env.exclusivoCurso || "",
      observacoes: env.observacoes || "",
      recursos: env.recursos || [],
    });
    setIsEnvModalOpen(true);
  };

  const handleSaveAll = async () => {
    if (formData.capacidade <= 0 || isNaN(formData.capacidade)) {
      toast.error("A capacidade do ambiente deve ser maior que zero.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await environmentApi.atualizarAmbiente(editingId, formData);
        toast.success("Dados salvos com sucesso!");
      } else {
        await environmentApi.cadastrarAmbiente(formData);
        toast.success("Ambiente cadastrado com sucesso!");
      }
      setIsEnvModalOpen(false);
      setIsFichaModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar dados.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEnvironment = async () => {
    if (!deletingId) return;
    try {
      await environmentApi.desativarAmbiente(deletingId);
      toast.success("Ambiente desativado!");
      loadData();
    } catch (error) {
      toast.error("Erro ao desativar ambiente.");
    } finally {
      setIsDeleteAlertOpen(false);
      setDeletingId(null);
    }
  };

  const handleReactivateEnvironment = async (id: string) => {
    try {
      await environmentApi.ativarAmbiente(id);
      toast.success("Ambiente reativado!");
      loadData();
    } catch (error) {
      toast.error("Erro ao reativar ambiente.");
    }
  };

  const handleClearFicha = async () => {
      setFormData(prev => ({
          ...prev,
          observacoes: "",
          recursos: []
      }));
      toast.info("Campos da ficha técnica limpos localmente.");
  };

  const addRecursoTag = () => {
    if (!recursoInput.trim()) return;
    if (!formData.recursos.includes(recursoInput.trim())) {
        setFormData(prev => ({
            ...prev,
            recursos: [...prev.recursos, recursoInput.trim()]
        }));
    }
    setRecursoInput("");
  };

  const removeRecursoTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      recursos: prev.recursos.filter(t => t !== tag)
    }));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestão de Ambientes</h1>
            <p className="text-sm text-slate-500">Configurações técnicas e catálogo de espaços físicos UniFil.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="show-inactive" 
                    checked={!apenasAtivos} 
                    onCheckedChange={(val) => setApenasAtivos(!val)} 
                />
                <Label htmlFor="show-inactive" className="text-xs font-bold text-slate-500 uppercase cursor-pointer">Mostrar Desativados</Label>
            </div>
            <Button 
                onClick={handleOpenCreate}
                className="rounded-md h-10 px-6 font-bold text-xs uppercase"
            >
                <Plus className="w-4 h-4 mr-2" /> Novo Cadastro
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <p className="text-slate-500 font-medium">Carregando ambientes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {environments.map((env) => (
                  <Card key={env.idAmbiente} className={`rounded-md border-slate-200 shadow-sm overflow-hidden flex flex-col group ${!env.ativo ? 'opacity-60 bg-slate-50' : ''}`}>
                      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-bold uppercase text-[10px] bg-white text-slate-500 border-slate-200">
                                {env.categoria}
                            </Badge>
                            {!env.ativo && <Badge className="bg-slate-400 text-white text-[9px] uppercase">Desativado</Badge>}
                          </div>
                          <div className="flex gap-1">
                            {env.ativo ? (
                                <>
                                    <Button onClick={() => handleOpenEdit(env)} size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-primary">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => { setDeletingId(env.idAmbiente); setIsDeleteAlertOpen(true); }} size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            ) : (
                                <div className="flex gap-1">
                                    <Button onClick={() => handleReactivateEnvironment(env.idAmbiente)} size="sm" variant="outline" className="h-8 gap-1.5 text-[10px] font-bold uppercase border-slate-300">
                                        <RefreshCw className="w-3.5 h-3.5" /> Reativar
                                    </Button>
                                </div>
                            )}
                          </div>
                      </div>
                      <CardContent className="p-6 flex-1 flex flex-col">
                          <h2 className="text-lg font-bold text-slate-900 mb-1">{env.nomeSala}</h2>
                          
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4 uppercase">
                              <Users className="w-3.5 h-3.5" />
                              <span>Lotação: {env.capacidade}</span>
                          </div>

                          {env.exclusivoCurso && (
                              <div className="mb-4 p-2 bg-amber-50 border border-amber-100 rounded text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                                  Exclusivo: {env.exclusivoCurso}
                              </div>
                          )}

                          {env.observacoes && (
                              <div className="mb-6 text-[11px] text-slate-600 line-clamp-2">
                                  <span className="font-bold uppercase text-slate-400 mr-1">Obs:</span>
                                  {env.observacoes}
                              </div>
                          )}

                          <div className="mt-auto pt-4 border-t border-slate-50 space-y-3">
                              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Ficha Técnica / Recursos</p>
                              <div className="flex flex-wrap gap-1.5">
                                  {env.recursos && env.recursos.length > 0 ? (
                                    env.recursos.map((res, idx) => (
                                      <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-600 uppercase">
                                          <Info className="w-2.5 h-2.5 text-primary" /> {res}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">Nenhuma informação técnica</span>
                                  )}
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              ))}
          </div>
        )}
      </div>

      <Dialog open={isEnvModalOpen} onOpenChange={setIsEnvModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Ambiente" : "Novo Ambiente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-[10px] text-red-500 font-bold uppercase">* Campos obrigatórios</p>
            <div className="grid gap-2">
              <Label htmlFor="nomeSala">Nome da Sala / Laboratório <span className="text-red-500">*</span></Label>
              <Input
                id="nomeSala"
                value={formData.nomeSala}
                onChange={(e) => setFormData({ ...formData, nomeSala: e.target.value })}
                placeholder="Ex: Sala 101, Lab de Informática"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="capacidade">Capacidade <span className="text-red-500">*</span></Label>
                <Input
                  id="capacidade"
                  type="number"
                  min="1"
                  value={formData.capacidade}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, capacidade: isNaN(val) ? 0 : Math.max(0, val) });
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoria <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(val) => setFormData({ ...formData, categoria: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teórica">Teórica</SelectItem>
                    <SelectItem value="Laboratório">Laboratório</SelectItem>
                    <SelectItem value="Auditório">Auditório</SelectItem>
                    <SelectItem value="Multimídia">Multimídia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exclusivoCurso">Exclusivo para Curso (Opcional)</Label>
              <Input
                id="exclusivoCurso"
                value={formData.exclusivoCurso}
                onChange={(e) => setFormData({ ...formData, exclusivoCurso: e.target.value })}
                placeholder="Ex: Engenharia de Software"
              />
            </div>

            <div className="pt-4">
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full flex items-center justify-center gap-2 border-dashed border-2"
                    onClick={() => setIsFichaModalOpen(true)}
                >
                    <ClipboardType className="w-4 h-4" />
                    {formData.observacoes || formData.recursos.length > 0 
                        ? "Editar Ficha Técnica" 
                        : "Adicionar Ficha Técnica (Opcional)"}
                </Button>
            </div>

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => setIsEnvModalOpen(false)}>Cancelar</Button>
              <Button type="button" onClick={handleSaveAll} disabled={isSubmitting || !formData.nomeSala}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : (editingId ? "Salvar Alterações" : "Cadastrar Ambiente")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isFichaModalOpen} onOpenChange={setIsFichaModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <ClipboardType className="w-5 h-5 text-primary" />
                Ficha Técnica
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Button variant="link" onClick={handleClearFicha} className="h-auto p-0 text-[10px] text-red-500 font-bold uppercase">Limpar Ficha</Button>
              </div>
              <textarea
                id="observacoes"
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Detalhes específicos sobre o estado ou uso da sala..."
              />
            </div>

            <div className="space-y-3">
              <Label>Recursos e Equipamentos</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Ex: Ar Condicionado"
                  value={recursoInput}
                  onChange={(e) => setRecursoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addRecursoTag()}
                />
                <Button type="button" size="icon" onClick={addRecursoTag}>
                    <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 p-3 border border-slate-100 rounded-md bg-slate-50/50 min-h-[100px] content-start">
                  {formData.recursos.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">Digite um recurso e pressione "+" para adicionar.</p>
                  )}
                  {formData.recursos.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1.5 py-1 px-2 bg-white border-slate-200">
                      <span className="text-[10px] font-bold text-slate-700">{tag}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeRecursoTag(tag)}
                      />
                    </Badge>
                  ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" className="w-full font-bold" onClick={() => setIsFichaModalOpen(false)}>Concluir Ficha Técnica</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá desativar o ambiente do sistema. Ele não aparecerá mais para reservas, mas os dados históricos serão mantidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEnvironment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
