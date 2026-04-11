import { Layout } from "./Layout";
import { Card, CardContent } from "./ui/card";
import { mockAuditLogs } from "../data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, FileText, User, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { cn } from "./ui/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export function AuditLogPage() {
  const getActionColor = (action: string) => {
    if (action.includes("aprovada")) return "text-emerald-600";
    if (action.includes("recusada")) return "text-red-600";
    if (action.includes("criada")) return "text-blue-600";
    return "text-slate-600";
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Trilha de Auditoria</h1>
                <p className="text-sm text-slate-500">Histórico técnico de operações realizadas no banco de dados.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md font-bold text-[10px] uppercase border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Registros Imutáveis
            </div>
        </div>

        <Card className="rounded-md border-slate-200 shadow-none overflow-hidden">
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="text-[10px] font-bold uppercase text-slate-400">Data/Hora</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase text-slate-400">Evento</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase text-slate-400">Usuário</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase text-slate-400">Detalhes da Transação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockAuditLogs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-slate-50/50">
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(log.timestamp), "dd/MM/yy HH:mm")}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={cn("text-xs font-bold uppercase tracking-wider", getActionColor(log.action))}>
                                        {log.action}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px]">
                                            {log.userName.charAt(0)}
                                        </div>
                                        {log.userName}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
                                        {log.details}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </Layout>
  );
}