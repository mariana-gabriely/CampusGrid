import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Card, CardContent } from "./ui/card";
import { format } from "date-fns";
import { Clock, ShieldCheck, Loader2, Inbox, ArrowRight, Search, Filter } from "lucide-react";
import { cn } from "./ui/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { auditoriaApi } from "../lib/api";
import { toast } from "sonner";

interface LogAuditoria {
  idLog: string;
  acao: string;
  nomeUsuario: string;
  idReserva?: string;
  nomeAmbiente?: string;
  valorAntigo?: string;
  valorNovo?: string;
  detalhes?: string;
  createdAt: string;
}

const acaoLabel: Record<string, { label: string; color: string }> = {
  SOLICITACAO_CRIADA:             { label: "Solicitação Criada",           color: "text-blue-600" },
  RESERVA_APROVADA:               { label: "Reserva Aprovada",             color: "text-emerald-600" },
  RESERVA_RECUSADA:               { label: "Reserva Recusada",             color: "text-red-600" },
  RESERVA_CANCELADA:              { label: "Reserva Cancelada",            color: "text-orange-600" },
  PERMUTA_PROPOSTA:               { label: "Permuta Proposta",             color: "text-purple-600" },
  PERMUTA_ACEITA_DESTINATARIO:    { label: "Permuta Aceita (Docente)",     color: "text-indigo-600" },
  PERMUTA_RECUSADA_DESTINATARIO:  { label: "Permuta Recusada (Docente)",   color: "text-rose-600" },
  PERMUTA_APROVADA_GESTOR:        { label: "Permuta Homologada",           color: "text-emerald-700" },
  PERMUTA_RECUSADA_GESTOR:        { label: "Permuta Rejeitada pelo Gestor",color: "text-rose-700" },
  PERMUTA_CANCELADA:              { label: "Permuta Cancelada",            color: "text-red-500" }
};

export function AuditLogPage() {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("TODAS");

  useEffect(() => {
    auditoriaApi.listarHistorico()
      .then(setLogs)
      .catch(() => toast.error("Erro ao carregar trilha de auditoria"))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.nomeUsuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.nomeAmbiente && log.nomeAmbiente.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.detalhes && log.detalhes.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesAction = selectedAction === "TODAS" || log.acao === selectedAction;
    
    return matchesSearch && matchesAction;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Trilha de Auditoria</h1>
            <p className="text-sm text-slate-500">Histórico técnico de operações realizadas no sistema de reservas.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md font-bold text-[10px] uppercase border border-slate-200 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" /> Registros Imutáveis
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por usuário, ambiente ou detalhes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-slate-200 bg-white rounded-md shadow-none"
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="h-11 border-slate-200 bg-white rounded-md shadow-none">
                <SelectValue placeholder="Filtrar por evento..." />
              </SelectTrigger>
              <SelectContent className="rounded-md">
                <SelectItem value="TODAS">Todos os Eventos</SelectItem>
                <SelectItem value="SOLICITACAO_CRIADA">Solicitação Criada</SelectItem>
                <SelectItem value="RESERVA_APROVADA">Reserva Aprovada</SelectItem>
                <SelectItem value="RESERVA_RECUSADA">Reserva Recusada</SelectItem>
                <SelectItem value="RESERVA_CANCELADA">Reserva Cancelada</SelectItem>
                <SelectItem value="PERMUTA_PROPOSTA">Permuta Proposta</SelectItem>
                <SelectItem value="PERMUTA_APROVADA_GESTOR">Permuta Homologada</SelectItem>
                <SelectItem value="PERMUTA_CANCELADA">Permuta Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="rounded-md border-slate-200 shadow-none overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-3 text-slate-300">
                <Inbox className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">Nenhum registro de auditoria encontrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase text-slate-400">Data/Hora</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-slate-400">Evento</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-slate-400">Usuário</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-slate-400">Ambiente</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-slate-400">Alteração</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase text-slate-400">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const meta = acaoLabel[log.acao] ?? { label: log.acao, color: "text-slate-600" };
                    return (
                      <TableRow key={log.idLog} className="hover:bg-slate-50/50">
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Clock className="w-3 h-3" />
                            {format(new Date(log.createdAt), "dd/MM/yy HH:mm")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn("text-xs font-bold uppercase tracking-wider", meta.color)}>
                            {meta.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px]">
                              {log.nomeUsuario.charAt(0).toUpperCase()}
                            </div>
                            {log.nomeUsuario}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500 font-medium">{log.nomeAmbiente ?? "—"}</span>
                        </TableCell>
                        <TableCell>
                          {log.valorAntigo || log.valorNovo ? (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                              {log.valorAntigo && <span className="bg-red-50 text-red-600 px-1 rounded">{log.valorAntigo}</span>}
                              {log.valorAntigo && log.valorNovo && <ArrowRight className="w-3 h-3" />}
                              {log.valorNovo && <span className="bg-emerald-50 text-emerald-700 px-1 rounded">{log.valorNovo}</span>}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs truncate">
                            {log.detalhes ?? "—"}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}