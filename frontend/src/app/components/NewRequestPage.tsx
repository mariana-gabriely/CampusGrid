import { useEffect, useState, useRef } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, Calendar, Clock, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { environmentApi, reservaApi } from "../lib/api";
import { Ambiente } from "../types";
import { Textarea } from "./ui/textarea";
import { format } from "date-fns";

export function NewRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [environments, setEnvironments] = useState<Ambiente[]>([]);
  const [loadingEnvs, setLoadingEnvs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [environmentId, setEnvironmentId] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [publicoEsperado, setPublicoEsperado] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);

  const [needsProjector, setNeedsProjector] = useState(false);
  const [needsTV, setNeedsTV] = useState(false);
  const [needsMicrophone, setNeedsMicrophone] = useState(false);
  const [needsControlledAccess, setNeedsControlledAccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoadingEnvs(true);
      try {
        const envs = await environmentApi.listarTodos(true);
        setEnvironments(envs);

        if (editId) {
          const res = await reservaApi.obterPorId(editId);
          setEnvironmentId(res.idAmbiente);
          setRequestDate(format(new Date(res.dataInicio), "yyyy-MM-dd"));
          setStartTime(format(new Date(res.dataInicio), "HH:mm"));
          setEndTime(format(new Date(res.dataFim), "HH:mm"));
          setObservacoes(res.observacoes || "");
          setPublicoEsperado(res.publicoEsperado ? String(res.publicoEsperado) : "");
          setExistingFileName(res.anexoNome);
        }
      } catch (err) {
        toast.error("Erro ao carregar dados do formulário");
      } finally {
        setLoadingEnvs(false);
      }
    };
    init();
  }, [editId]);

  const selectedEnvironment = environments.find(e => e.idAmbiente === environmentId);

  const filteredEnvironments = environments.filter(env => {
    if (publicoEsperado && env.capacidade < Number(publicoEsperado)) {
      return false;
    }
    const envRecursos = (env.recursos || []).map(r => r.toLowerCase());
    if (needsProjector && !envRecursos.some(r => r.includes("projetor"))) return false;
    if (needsTV && !envRecursos.some(r => r.includes("tv"))) return false;
    if (needsMicrophone && !envRecursos.some(r => r.includes("microfone"))) return false;
    if (needsControlledAccess && !envRecursos.some(r => r.includes("acesso restrito") || r.includes("acesso controlado"))) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!environmentId) {
      toast.error("Selecione um ambiente");
      return;
    }
    if (!requestDate || !startTime || !endTime) {
      toast.error("Preencha a data e os horários de início e fim");
      return;
    }

    const dataInicio = `${requestDate}T${startTime}:00`;
    const dataFim = `${requestDate}T${endTime}:00`;

    if (new Date(dataFim) <= new Date(dataInicio)) {
      toast.error("O horário de término deve ser posterior ao horário de início");
      return;
    }

    if (selectedEnvironment && 
        (selectedEnvironment.categoria === "LABORATORIO" || selectedEnvironment.categoria === "AUDITORIO") && 
        !selectedFile && !existingFileName) {
      toast.error("O upload de um documento comprobatório (PDF) é obrigatório para laboratórios e auditórios.");
      return;
    }

    const recursosRequisitados: string[] = [];
    if (needsProjector) recursosRequisitados.push("Projetor");
    if (needsTV) recursosRequisitados.push("TV Smart");
    if (needsMicrophone) recursosRequisitados.push("Microfone");
    if (needsControlledAccess) recursosRequisitados.push("Acesso Restrito");

    setSubmitting(true);
    try {
      if (editId) {
        await reservaApi.atualizar(editId, {
          idAmbiente: environmentId,
          dataInicio,
          dataFim,
          observacoes: observacoes.trim() || undefined,
          publicoEsperado: publicoEsperado ? Number(publicoEsperado) : undefined,
          recursosRequisitados,
          file: selectedFile || undefined
        });
        toast.success("Reserva atualizada com sucesso!");
      } else {
        await reservaApi.solicitar({
          idAmbiente: environmentId,
          dataInicio,
          dataFim,
          observacoes: observacoes.trim() || undefined,
          publicoEsperado: publicoEsperado ? Number(publicoEsperado) : undefined,
          recursosRequisitados,
          file: selectedFile || undefined
        });
        toast.success("Solicitação enviada para análise com sucesso!");
      }
      navigate("/my-requests");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar reserva");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{editId ? "Editar Solicitação" : "Nova Solicitação"}</h1>
          <p className="text-sm text-slate-500">
            Formulário oficial de reserva de ambientes. <span className="text-xs text-red-500 font-bold ml-2">* Campos obrigatórios</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-md border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    1. Seleção de Ambiente <span className="text-red-500">*</span>
                  </Label>
                  {loadingEnvs ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" /> Carregando ambientes...
                    </div>
                  ) : (
                    <Select value={environmentId} onValueChange={setEnvironmentId}>
                      <SelectTrigger className="h-11 rounded-md border-slate-200 bg-white">
                        <SelectValue placeholder="Selecione o local..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-md">
                        {filteredEnvironments.map((env) => (
                          <SelectItem key={env.idAmbiente} value={env.idAmbiente}>
                            {env.nomeSala} (Cap: {env.capacidade}) - {env.categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    2. Cronograma (Início e Fim) <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase"><Calendar className="w-3 h-3" /> Data <span className="text-red-500">*</span></p>
                      <Input type="date" value={requestDate} onChange={e => setRequestDate(e.target.value)} className="h-10 rounded-md border-slate-200" required />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase"><Clock className="w-3 h-3" /> Horários <span className="text-red-500">*</span></p>
                      <div className="flex items-center gap-2">
                        <Input type="time" placeholder="De" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-10 rounded-md border-slate-200" required />
                        <span className="text-slate-300">/</span>
                        <Input type="time" placeholder="Até" value={endTime} onChange={e => setEndTime(e.target.value)} className="h-10 rounded-md border-slate-200" required />
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">Público Esperado</p>
                      <Input type="number" placeholder="Quantidade de participantes (opcional)..." value={publicoEsperado} onChange={e => setPublicoEsperado(e.target.value)} className="h-10 rounded-md border-slate-200" min="1" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <Label className="text-xs font-bold uppercase text-slate-500">3. Recursos Necessários</Label>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {[
                      { id: 'p', label: 'Projetor', state: needsProjector, set: setNeedsProjector },
                      { id: 't', label: 'TV Smart', state: needsTV, set: setNeedsTV },
                      { id: 'm', label: 'Microfone', state: needsMicrophone, set: setNeedsMicrophone },
                      { id: 'a', label: 'Acesso Restrito', state: needsControlledAccess, set: setNeedsControlledAccess },
                    ].map(item => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox id={item.id} checked={item.state} onCheckedChange={c => item.set(c as boolean)} className="rounded border-slate-300" />
                        <label htmlFor={item.id} className="text-sm font-medium text-slate-600 cursor-pointer">{item.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <Label className="text-xs font-bold uppercase text-slate-500">4. Observações / Justificativa</Label>
                  <Textarea
                    placeholder="Informe detalhes do evento ou disciplina..."
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    className="rounded-md border-slate-200 resize-none h-20 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Label className="text-xs font-bold uppercase text-slate-500 block mb-4">5. Anexos e Documentação</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  accept=".pdf"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-md p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-primary transition-colors" />
                  {selectedFile ? (
                    <p className="text-sm font-bold text-emerald-600 truncate">Arquivo: {selectedFile.name}</p>
                  ) : existingFileName ? (
                    <p className="text-sm font-bold text-emerald-600 truncate">Arquivo atual: {existingFileName} (Clique para alterar)</p>
                  ) : (
                    <p className="text-sm font-bold text-slate-500">Clique para enviar arquivos PDF (opcional)</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1 uppercase">Plano de aula ou autorização NPI</p>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={submitting} className="w-full h-12 rounded-md font-bold uppercase tracking-wider text-xs bg-primary hover:opacity-90">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Finalizar e Enviar Pedido
            </Button>
          </div>

          <div className="space-y-6">
            <Card className="rounded-md border-slate-200 shadow-sm bg-slate-50/50">
              <CardHeader className="py-4 border-b border-slate-200">
                <CardTitle className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Informações Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {selectedEnvironment ? (
                  <>
                    <div>
                      <p className="text-lg font-bold text-slate-900 leading-tight">{selectedEnvironment.nomeSala}</p>
                      <p className="text-xs font-bold text-primary uppercase mt-1">{selectedEnvironment.categoria}</p>
                    </div>
                    <div className="space-y-2 border-t border-slate-200 pt-4 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-400 uppercase font-bold text-[9px]">Capacidade</span>
                        <span className="text-slate-700">{selectedEnvironment.capacidade} pessoas</span>
                      </div>
                      {selectedEnvironment.recursos && selectedEnvironment.recursos.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-slate-400 uppercase font-bold text-[9px]">Recursos</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedEnvironment.recursos.map((r, i) => (
                              <span key={i} className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedEnvironment.exclusivoCurso && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800 font-medium">
                        ⚠️ Ambiente exclusivo para o curso de {selectedEnvironment.exclusivoCurso}.
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">Selecione um ambiente para ver os detalhes técnicos.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </Layout>
  );
}
