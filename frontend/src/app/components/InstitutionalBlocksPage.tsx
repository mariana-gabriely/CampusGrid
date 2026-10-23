import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { bloqueioApi, environmentApi } from "../lib/api";
import { Ambiente } from "../types";
import { toast } from "sonner";

export function InstitutionalBlocksPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<Ambiente[]>([]);
  const [form, setForm] = useState({ idAmbiente: "", dataInicio: "", dataFim: "", motivo: "" });

  const load = async () => {
    try {
      const [b, e] = await Promise.all([bloqueioApi.listar(), environmentApi.listarTodos(true)]);
      setBlocks(b); setEnvironments(e);
    } catch { toast.error("Não foi possível carregar os bloqueios."); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await bloqueioApi.criar({ ...form, idAmbiente: form.idAmbiente || undefined,
        dataInicio: new Date(form.dataInicio).toISOString().slice(0, 19),
        dataFim: new Date(form.dataFim).toISOString().slice(0, 19) });
      toast.success("Bloqueio criado.");
      setForm({ idAmbiente: "", dataInicio: "", dataFim: "", motivo: "" }); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro ao criar bloqueio."); }
  };

  return <Layout><div className="max-w-5xl mx-auto space-y-6">
    <div><h1 className="text-2xl font-bold">Bloqueios institucionais</h1>
      <p className="text-sm text-slate-500">Reserve períodos para eventos, vestibulares ou manutenção.</p></div>
    <Card><CardContent className="p-6"><form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
      <div><Label>Ambiente</Label><select className="w-full h-10 border rounded px-3" value={form.idAmbiente}
        onChange={e => setForm({ ...form, idAmbiente: e.target.value })}>
        <option value="">Todo o campus</option>{environments.map(e => <option key={e.idAmbiente} value={e.idAmbiente}>{e.nomeSala}</option>)}</select></div>
      <div><Label>Motivo</Label><Input required value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })}/></div>
      <div><Label>Início</Label><Input type="datetime-local" required value={form.dataInicio} onChange={e => setForm({ ...form, dataInicio: e.target.value })}/></div>
      <div><Label>Fim</Label><Input type="datetime-local" required value={form.dataFim} onChange={e => setForm({ ...form, dataFim: e.target.value })}/></div>
      <Button type="submit">Criar bloqueio</Button>
    </form></CardContent></Card>
    <div className="space-y-3">{blocks.map(b => <Card key={b.idBloqueio}><CardContent className="p-4 flex justify-between items-center">
      <div><p className="font-bold">{b.nomeAmbiente}</p><p className="text-sm text-slate-500">{b.motivo}</p>
        <p className="text-xs text-slate-400">{new Date(b.dataInicio).toLocaleString()} até {new Date(b.dataFim).toLocaleString()}</p></div>
      <Button variant="outline" onClick={async()=>{await bloqueioApi.cancelar(b.idBloqueio);load();}}>Cancelar bloqueio</Button>
    </CardContent></Card>)}</div>
  </div></Layout>;
}
