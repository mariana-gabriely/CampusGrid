import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FileBarChart, Download, TrendingUp, CalendarCheck, XCircle, FileText, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "./ui/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { startOfWeek, endOfWeek, format, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { environmentApi, reservaApi } from "../lib/api";
import { Ambiente } from "../types";

interface Reserva {
  idReserva: string;
  idAmbiente: string;
  nomeAmbiente: string;
  nomeSolicitante: string;
  dataInicio: string;
  dataFim: string;
  status: "PENDENTE" | "APROVADO" | "RECUSADO";
  observacoes?: string;
}

export function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");

  const [environments, setEnvironments] = useState<Ambiente[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      environmentApi.listarTodos(true),
      reservaApi.listarTodas(),
    ])
      .then(([envs, resList]) => {
        setEnvironments(envs);
        setReservas(resList);
      })
      .catch(() => toast.error("Erro ao carregar dados dos relatórios"))
      .finally(() => setLoading(false));
  }, []);

  const total = reservas.length;
  const approved = reservas.filter(r => r.status === "APROVADO").length;
  const rejected = reservas.filter(r => r.status === "RECUSADO").length;
  const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const stats = { total, approved, rejected, rate };

  const generateWeeks = () => {
    const weeks = [];
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const date = addWeeks(today, i);
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      const label = `${format(start, "dd")} a ${format(end, "dd 'de' MMMM", { locale: ptBR })}`;
      weeks.push({ id: start.toISOString(), label });
    }
    return weeks;
  };

  const weeksOptions = generateWeeks();

  const handleGeneratePDF = () => {
    if (!selectedEnv || !selectedWeek) {
      toast.error("Selecione o ambiente e a semana desejada.");
      return;
    }

    const env = environments.find(e => e.idAmbiente === selectedEnv);
    const weekObj = weeksOptions.find(w => w.id === selectedWeek);
    if (!env || !weekObj) return;

    const weekStart = new Date(weekObj.id);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeReservas = reservas.filter(r => {
      const rDate = new Date(r.dataInicio);
      return r.idAmbiente === env.idAmbiente && 
             r.status === "APROVADO" && 
             rDate >= weekStart && 
             rDate < weekEnd;
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Por favor, permita pop-ups para gerar o documento.");
      return;
    }

    let bookingsHtml = "";
    const days = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      const dayBookings = activeReservas.filter(r => {
        const d = new Date(r.dataInicio);
        return d.getDate() === currentDay.getDate() && 
               d.getMonth() === currentDay.getMonth() && 
               d.getFullYear() === currentDay.getFullYear();
      }).sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));

      bookingsHtml += `
        <div style="margin-bottom: 24px; page-break-inside: avoid;">
          <h3 style="border-bottom: 2px solid #ef8f23; padding-bottom: 6px; color: #1e293b; font-size: 14px; text-transform: uppercase; font-family: sans-serif; margin-bottom: 10px;">
            ${days[i]} - ${format(currentDay, "dd/MM/yyyy")}
          </h3>
          ${dayBookings.length === 0 
            ? `<p style="color: #64748b; font-style: italic; font-size: 12px; margin: 8px 0; font-family: sans-serif;">Nenhuma reserva alocada para este dia.</p>`
            : `
              <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-family: sans-serif;">
                <thead>
                  <tr style="background: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">
                    <th style="padding: 8px 12px; border: 1px solid #cbd5e1;">Horário</th>
                    <th style="padding: 8px 12px; border: 1px solid #cbd5e1;">Solicitante</th>
                    <th style="padding: 8px 12px; border: 1px solid #cbd5e1;">Finalidade/Observações</th>
                  </tr>
                </thead>
                <tbody>
                  ${dayBookings.map(b => `
                    <tr style="font-size: 12px; color: #334155;">
                      <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; width: 120px;">
                        ${format(new Date(b.dataInicio), "HH:mm")} - ${format(new Date(b.dataFim), "HH:mm")}
                      </td>
                      <td style="padding: 8px 12px; border: 1px solid #e2e8f0; width: 200px;">
                        ${b.nomeSolicitante || "Docente"}
                      </td>
                      <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">
                        ${b.observacoes || "NPI / Aula Acadêmica"}
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `
          }
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>CampusGrid - Ocupação ${env.nomeSala}</title>
          <style>
            body { font-family: sans-serif; margin: 40px; color: #334155; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px double #cbd5e1; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #ef8f23; margin: 0; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 12px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">CAMPUSGRID - RELATÓRIO DE OCUPAÇÃO</h1>
            <div class="subtitle">UniFil - Centro Universitário Filadélfia</div>
          </div>
          <div class="meta">
            <div><strong>Ambiente:</strong> ${env.nomeSala} (${env.categoria})</div>
            <div><strong>Semana:</strong> ${weekObj.label}</div>
            <div><strong>Capacidade:</strong> ${env.capacidade} alunos</div>
          </div>
          ${bookingsHtml}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setIsModalOpen(false);
  };

  // Demanda por dia da semana
  const dayNames = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
  const weeklyData = dayNames.map((day, index) => {
    // index 0 = Monday (day 1 in JS getDay())
    const dayJsIndex = index === 6 ? 0 : index + 1;
    const count = reservas.filter(r => new Date(r.dataInicio).getDay() === dayJsIndex).length;
    return { day, reservas: count };
  });

  // Ocupação por ambiente
  const envUsage = environments.map((env) => ({
    name: env.nomeSala.substring(0, 14),
    reservas: reservas.filter(r => r.idAmbiente === env.idAmbiente).length,
  }));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Relatórios Gerenciais</h1>
            <p className="text-sm text-slate-500">Métricas de ocupação e exportação de dados UniFil.</p>
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-md h-10 px-6 font-bold text-xs uppercase"
          >
            <Download className="w-4 h-4 mr-2" />
            Gerar Mapa em PDF
          </Button>
        </div>

        {/* Modal de Configuração do PDF */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-900">
                <FileText className="w-5 h-5 text-primary" />
                Configurar Documento
              </DialogTitle>
              <p className="text-sm text-slate-500">Especifique os filtros para a exportação oficial.</p>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Selecione o Ambiente</Label>
                <Select value={selectedEnv} onValueChange={setSelectedEnv}>
                  <SelectTrigger className="h-11 rounded-md border-slate-200 bg-white shadow-none">
                    <SelectValue placeholder="Escolha um local..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    {environments.map((env) => (
                      <SelectItem key={env.idAmbiente} value={env.idAmbiente}>
                        {env.nomeSala}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Selecione a Semana</Label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="h-11 rounded-md border-slate-200 bg-white shadow-none">
                    <SelectValue placeholder="Escolha o período..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    {weeksOptions.map((week) => (
                      <SelectItem key={week.id} value={week.id}>
                        {week.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-md h-11 flex-1 font-bold uppercase text-xs">
                Cancelar
              </Button>
              <Button onClick={handleGeneratePDF} className="rounded-md h-11 flex-1 font-bold uppercase text-xs bg-primary hover:bg-primary/90">
                Confirmar e Gerar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Solicitações', val: stats.total, icon: FileBarChart, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Aprovadas', val: stats.approved, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Recusadas', val: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Taxa de Aceite', val: `${stats.rate}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map((stat, i) => (
                <Card key={i} className="rounded-md border-slate-200 shadow-none">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.val}</p>
                    </div>
                    <div className={cn("w-10 h-10 rounded flex items-center justify-center", stat.bg, stat.color)}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-md border-slate-200 shadow-none">
                <CardHeader className="py-4 border-b border-slate-50">
                  <CardTitle className="text-xs font-bold uppercase text-slate-400">Demanda Semanal</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '4px', border: '1px solid #e2e8f0', shadow: 'none'}}/>
                        <Bar dataKey="reservas" fill="#EF8F23" radius={[2, 2, 0, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-md border-slate-200 shadow-none">
                <CardHeader className="py-4 border-b border-slate-50">
                  <CardTitle className="text-xs font-bold uppercase text-slate-400">Ocupação por Local</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={envUsage} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} width={90} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '4px', border: '1px solid #e2e8f0', shadow: 'none'}}/>
                        <Bar dataKey="reservas" fill="#10b981" radius={[0, 2, 2, 0]} maxBarSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}