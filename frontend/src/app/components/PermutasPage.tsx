import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeftRight, Check, X, Clock, HelpCircle, Loader2, Send, Inbox, AlertTriangle, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { reservaApi, permutaApi } from "../lib/api";

interface Reserva {
  idReserva: string;
  nomeAmbiente: string;
  categoriaAmbiente: string;
  idSolicitante: string;
  nomeSolicitante: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  observacoes?: string;
  createdAt: string;
}

interface Permuta {
  idPermuta: string;
  idReservaSolicitante: string;
  nomeSolicitante: string;
  ambienteSolicitanteNome: string;
  dataInicioSolicitante: string;
  dataFimSolicitante: string;
  idReservaDestinatario: string;
  nomeDestinatario: string;
  ambienteDestinatarioNome: string;
  dataInicioDestinatario: string;
  dataFimDestinatario: string;
  status: string; // PENDENTE_ACEITE, RECUSADA_DESTINATARIO, PENDENTE_GESTOR, APROVADA_GESTOR, RECUSADA_GESTOR
  motivoRecusa?: string;
  createdAt: string;
}

export function PermutasPage() {
  const { user } = useAuth();
  const [minhasAprovadas, setMinhasAprovadas] = useState<Reserva[]>([]);
  const [outrasAprovadas, setOutrasAprovadas] = useState<Reserva[]>([]);
  const [recebidas, setRecebidas] = useState<Permuta[]>([]);
  const [enviadas, setEnviadas] = useState<Permuta[]>([]);
  const [pendentesGestor, setPendentesGestor] = useState<Permuta[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // States for Propose Form
  const [selectedMinhaId, setSelectedMinhaId] = useState("");
  const [selectedOutraId, setSelectedOutraId] = useState("");

  // States for Rejection
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectMode, setRejectMode] = useState<"DESTINATARIO" | "GESTOR">("DESTINATARIO");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.perfil === "SOLICITANTE") {
        // Fetch my approved reservations
        const minhas = await reservaApi.listarMinhas();
        setMinhasAprovadas(minhas.filter((r: any) => r.status === "APROVADO"));

        // Fetch other approved reservations in a broad period (last 30 days to next 365 days)
        const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const end = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const ocupacoes = await reservaApi.ocupacaoNoPeriodo(start, end);
        // Exclude my own reservations
        setOutrasAprovadas(ocupacoes.filter((r: any) => r.idSolicitante !== user.idUsuario));

        // Fetch permutas
        const rec = await permutaApi.listarRecebidas();
        setRecebidas(rec);
        const env = await permutaApi.listarEnviadas();
        setEnviadas(env);
      } else {
        // Aprovador / Gestor
        const pendentes = await permutaApi.listarPendentesGestor();
        setPendentesGestor(pendentes);
      }
    } catch (e) {
      toast.error("Erro ao carregar dados de permutas");
    } finally {
      setLoading(false);
    }
  };

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinhaId || !selectedOutraId) {
      toast.error("Selecione ambas as reservas para propor a permuta");
      return;
    }

    setSubmitting(true);
    try {
      await permutaApi.propor({
        idReservaSolicitante: selectedMinhaId,
        idReservaDestinatario: selectedOutraId,
      });
      toast.success("Proposta de permuta enviada com sucesso!");
      setSelectedMinhaId("");
      setSelectedOutraId("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao propor permuta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelar = async (id: string) => {
    if (!window.confirm("Deseja realmente cancelar esta proposta de permuta?")) return;
    setSubmitting(true);
    try {
      await permutaApi.cancelar(id);
      toast.success("Proposta de permuta cancelada.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar permuta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponderDestinatario = async (id: string, aceitar: boolean) => {
    if (!aceitar) {
      setRejectingId(id);
      setRejectMode("DESTINATARIO");
      setRejectionReason("");
      return;
    }

    setSubmitting(true);
    try {
      await permutaApi.responder(id, { aceitar: true });
      toast.success("Permuta aceita! Enviada para homologação do Gestor.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao responder permuta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvaliarGestor = async (id: string, aprovar: boolean) => {
    if (!aprovar) {
      setRejectingId(id);
      setRejectMode("GESTOR");
      setRejectionReason("");
      return;
    }

    setSubmitting(true);
    try {
      await permutaApi.avaliarGestor(id, { aprovar: true });
      toast.success("Permuta homologada com sucesso! As salas foram trocadas.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao homologar permuta");
    } finally {
      setSubmitting(false);
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Informe a justificativa da recusa");
      return;
    }
    if (!rejectingId) return;

    setSubmitting(true);
    try {
      if (rejectMode === "DESTINATARIO") {
        await permutaApi.responder(rejectingId, { aceitar: false, motivoRecusa: rejectionReason });
        toast.success("Proposta de permuta recusada");
      } else {
        await permutaApi.avaliarGestor(rejectingId, { aprovar: false, motivoRecusa: rejectionReason });
        toast.success("Permuta rejeitada");
      }
      setRejectingId(null);
      setRejectionReason("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao recusar permuta");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "APROVADA_GESTOR":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">APROVADA PELO GESTOR</span>;
      case "RECUSADA_GESTOR":
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">REJEITADA PELO GESTOR</span>;
      case "RECUSADA_DESTINATARIO":
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">RECUSADA PELO DESTINATÁRIO</span>;
      case "PENDENTE_GESTOR":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">AGUARDANDO GESTOR</span>;
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">PENDENTE ACEITE</span>;
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Permutas de Reserva</h1>
          <p className="text-sm text-slate-500">
            Troca de ambientes entre solicitantes com aceite mútuo e aprovação final do Gestor.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : user?.perfil === "SOLICITANTE" ? (
          <Tabs defaultValue="propose" className="w-full space-y-6">
            <TabsList className="bg-slate-100 p-1 rounded-md border border-slate-200 w-fit">
              <TabsTrigger value="propose" className="rounded-sm px-4 py-2 font-semibold text-xs tracking-wider uppercase">Propor Permuta</TabsTrigger>
              <TabsTrigger value="received" className="rounded-sm px-4 py-2 font-semibold text-xs tracking-wider uppercase">Propostas Recebidas ({recebidas.length})</TabsTrigger>
              <TabsTrigger value="sent" className="rounded-sm px-4 py-2 font-semibold text-xs tracking-wider uppercase">Propostas Enviadas ({enviadas.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="propose" className="space-y-6 outline-none">
              <form onSubmit={handlePropose} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-6">
                  <Card className="rounded-md border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-100 py-4">
                      <CardTitle className="text-xs font-bold uppercase text-slate-400">Nova Proposta de Permuta</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">1. Selecione a sua reserva aprovada</Label>
                        <Select value={selectedMinhaId} onValueChange={setSelectedMinhaId}>
                          <SelectTrigger className="h-11 rounded-md border-slate-200 bg-white">
                            <SelectValue placeholder="Selecione uma de suas reservas..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-md">
                            {minhasAprovadas.map((r) => (
                              <SelectItem key={r.idReserva} value={r.idReserva}>
                                {r.nomeAmbiente} - {format(new Date(r.dataInicio), "dd/MM/yyyy")} ({format(new Date(r.dataInicio), "HH:mm")} - {format(new Date(r.dataFim), "HH:mm")})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-center py-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                          <ArrowLeftRight className="w-5 h-5 rotate-90 md:rotate-0" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">2. Selecione a reserva de outro docente que deseja permutar</Label>
                        <Select value={selectedOutraId} onValueChange={setSelectedOutraId}>
                          <SelectTrigger className="h-11 rounded-md border-slate-200 bg-white">
                            <SelectValue placeholder="Selecione a reserva de destino..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-md">
                            {outrasAprovadas.map((r) => (
                              <SelectItem key={r.idReserva} value={r.idReserva}>
                                {r.nomeAmbiente} - {r.nomeSolicitante} - {format(new Date(r.dataInicio), "dd/MM/yyyy")} ({format(new Date(r.dataInicio), "HH:mm")} - {format(new Date(r.dataFim), "HH:mm")})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit" disabled={submitting} className="w-full h-12 rounded-md font-bold uppercase tracking-wider text-xs bg-primary hover:opacity-90">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        Enviar Proposta ao Docente
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="rounded-md border-slate-200 shadow-sm bg-slate-50/50">
                    <CardHeader className="py-4 border-b border-slate-200">
                      <CardTitle className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2">
                        <HelpCircle className="w-3.5 h-3.5" /> Como funciona a permuta?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
                      <p>
                        A permuta permite a troca física de salas entre dois professores.
                      </p>
                      <ol className="list-decimal pl-4 space-y-2">
                        <li>Você propõe a troca escolhendo a sua reserva e a reserva dele.</li>
                        <li>O outro professor recebe a proposta e pode <strong>aceitar</strong> ou <strong>recusar</strong>.</li>
                        <li>Se ele aceitar, o pedido vai para o <strong>Gestor do Campus</strong> para a homologação final.</li>
                        <li>O Gestor aprova e o sistema efetua a troca automática das salas no mapa de ocupação.</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="received" className="space-y-3 outline-none">
              {recebidas.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-md flex flex-col items-center gap-3">
                  <Inbox className="w-10 h-10 text-slate-200" />
                  <p className="text-slate-400 font-medium italic">Nenhuma proposta recebida pendente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recebidas.map((permuta) => (
                    <div key={permuta.idPermuta} className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-bold text-slate-900">
                          Proposta de: <span className="text-primary">{permuta.nomeSolicitante}</span>
                        </div>
                        {renderStatusBadge(permuta.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                        <div className="md:col-span-3 p-4 bg-slate-50 border border-slate-100 rounded">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">A Reserva Dele</p>
                          <p className="text-sm font-bold text-slate-900">{permuta.ambienteSolicitanteNome}</p>
                          <p className="text-xs text-slate-500 mt-1">{format(new Date(permuta.dataInicioSolicitante), "dd/MM/yyyy")} das {format(new Date(permuta.dataInicioSolicitante), "HH:mm")} às {format(new Date(permuta.dataFimSolicitante), "HH:mm")}</p>
                        </div>
                        <div className="flex justify-center md:col-span-1">
                          <ArrowLeftRight className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="md:col-span-3 p-4 bg-primary/5 border border-primary/10 rounded">
                          <p className="text-[10px] font-bold text-primary/60 uppercase mb-1">A Sua Reserva</p>
                          <p className="text-sm font-bold text-slate-900">{permuta.ambienteDestinatarioNome}</p>
                          <p className="text-xs text-slate-500 mt-1">{format(new Date(permuta.dataInicioDestinatario), "dd/MM/yyyy")} das {format(new Date(permuta.dataInicioDestinatario), "HH:mm")} às {format(new Date(permuta.dataFimDestinatario), "HH:mm")}</p>
                        </div>
                      </div>

                      {permuta.status === "PENDENTE_ACEITE" && (
                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            onClick={() => handleResponderDestinatario(permuta.idPermuta, true)}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-4 h-9 rounded"
                          >
                            <Check className="w-4 h-4 mr-1.5" /> Aceitar Troca
                          </Button>
                          <Button
                            onClick={() => handleResponderDestinatario(permuta.idPermuta, false)}
                            disabled={submitting}
                            variant="outline"
                            className="border-slate-200 hover:bg-red-50 hover:text-red-600 font-bold text-xs uppercase px-4 h-9 rounded"
                          >
                            <X className="w-4 h-4 mr-1.5" /> Recusar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-3 outline-none">
              {enviadas.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-md flex flex-col items-center gap-3">
                  <Inbox className="w-10 h-10 text-slate-200" />
                  <p className="text-slate-400 font-medium italic">Nenhuma proposta enviada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enviadas.map((permuta) => (
                    <div key={permuta.idPermuta} className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-bold text-slate-900">
                          Proposta para: <span className="text-primary">{permuta.nomeDestinatario}</span>
                        </div>
                        {renderStatusBadge(permuta.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                        <div className="md:col-span-3 p-4 bg-primary/5 border border-primary/10 rounded">
                          <p className="text-[10px] font-bold text-primary/60 uppercase mb-1">A Sua Reserva</p>
                          <p className="text-sm font-bold text-slate-900">{permuta.ambienteSolicitanteNome}</p>
                          <p className="text-xs text-slate-500 mt-1">{format(new Date(permuta.dataInicioSolicitante), "dd/MM/yyyy")} das {format(new Date(permuta.dataInicioSolicitante), "HH:mm")} às {format(new Date(permuta.dataFimSolicitante), "HH:mm")}</p>
                        </div>
                        <div className="flex justify-center md:col-span-1">
                          <ArrowLeftRight className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="md:col-span-3 p-4 bg-slate-50 border border-slate-100 rounded">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">A Reserva Dele</p>
                          <p className="text-sm font-bold text-slate-900">{permuta.ambienteDestinatarioNome}</p>
                          <p className="text-xs text-slate-500 mt-1">{format(new Date(permuta.dataInicioDestinatario), "dd/MM/yyyy")} das {format(new Date(permuta.dataInicioDestinatario), "HH:mm")} às {format(new Date(permuta.dataFimDestinatario), "HH:mm")}</p>
                        </div>
                      </div>

                      {permuta.motivoRecusa && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-700 font-medium">
                          ❌ <strong>Motivo da recusa:</strong> {permuta.motivoRecusa}
                        </div>
                      )}

                      {(permuta.status === "PENDENTE_ACEITE" || permuta.status === "PENDENTE_GESTOR") && (
                        <div className="flex justify-end pt-2">
                          <Button
                            onClick={() => handleCancelar(permuta.idPermuta)}
                            disabled={submitting}
                            variant="outline"
                            className="border-slate-200 hover:bg-red-50 hover:text-red-600 font-bold text-xs uppercase px-4 h-9 rounded shadow-none"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" /> Cancelar Proposta
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          // Gestor / Aprovador
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-800">Pendentes de Homologação Final ({pendentesGestor.length})</h2>
              <p className="text-xs text-slate-400">Homologação de permutas já acordadas mutuamente entre os docentes.</p>
            </div>

            {pendentesGestor.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-md flex flex-col items-center gap-3">
                <Inbox className="w-10 h-10 text-slate-200" />
                <p className="text-slate-400 font-medium italic">Nenhuma permuta aguardando homologação.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendentesGestor.map((permuta) => (
                  <div key={permuta.idPermuta} className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-bold text-slate-400 uppercase">Solicitação de Permuta de Salas</div>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">AGUARDANDO GESTOR</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                      <div className="md:col-span-3 p-4 bg-slate-50 border border-slate-100 rounded">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Docente A: {permuta.nomeSolicitante}</p>
                        <p className="text-sm font-bold text-slate-900">{permuta.ambienteSolicitanteNome}</p>
                        <p className="text-xs text-slate-500 mt-1">{format(new Date(permuta.dataInicioSolicitante), "dd/MM/yyyy")} das {format(new Date(permuta.dataInicioSolicitante), "HH:mm")} às {format(new Date(permuta.dataFimSolicitante), "HH:mm")}</p>
                      </div>
                      <div className="flex justify-center md:col-span-1">
                        <ArrowLeftRight className="w-5 h-5 text-slate-300" />
                      </div>
                      <div className="md:col-span-3 p-4 bg-slate-50 border border-slate-100 rounded">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Docente B: {permuta.nomeDestinatario}</p>
                        <p className="text-sm font-bold text-slate-900">{permuta.ambienteDestinatarioNome}</p>
                        <p className="text-xs text-slate-500 mt-1">{format(new Date(permuta.dataInicioDestinatario), "dd/MM/yyyy")} das {format(new Date(permuta.dataInicioDestinatario), "HH:mm")} às {format(new Date(permuta.dataFimDestinatario), "HH:mm")}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        onClick={() => handleAvaliarGestor(permuta.idPermuta, true)}
                        disabled={submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-4 h-9 rounded"
                      >
                        <Check className="w-4 h-4 mr-1.5" /> Homologar Permuta
                      </Button>
                      <Button
                        onClick={() => handleAvaliarGestor(permuta.idPermuta, false)}
                        disabled={submitting}
                        variant="outline"
                        className="border-slate-200 hover:bg-red-50 hover:text-red-600 font-bold text-xs uppercase px-4 h-9 rounded"
                      >
                        <X className="w-4 h-4 mr-1.5" /> Rejeitar Troca
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal/Form for Rejection Reason */}
        {rejectingId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full rounded-md shadow-2xl border-slate-200">
              <CardHeader className="border-b border-slate-100 py-4 flex flex-row items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <CardTitle className="text-sm font-bold uppercase">Justificativa da Recusa</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Motivo da Recusa</Label>
                  <Textarea
                    placeholder="Descreva detalhadamente o motivo para recusar a permuta..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="rounded-md border-slate-200 resize-none h-24 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 rounded-md" onClick={() => setRejectingId(null)}>Cancelar</Button>
                  <Button variant="destructive" className="flex-1 rounded-md font-bold" onClick={submitRejection} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirmar Recusa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
