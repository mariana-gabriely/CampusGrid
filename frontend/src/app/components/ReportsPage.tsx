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

  const handleGeneratePDF = async () => {
    if (!selectedEnv || !selectedWeek) {
      toast.error("Selecione o ambiente e a semana desejada.");
      return;
    }

    const env = environments.find(e => e.idAmbiente === selectedEnv);
    const weekObj = weeksOptions.find(w => w.id === selectedWeek);
    if (!env || !weekObj) return;

    const weekStart = new Date(weekObj.id);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    try {
      await reservaApi.downloadOcupacaoPdf(
        env.idAmbiente,
        weekStart.toISOString(),
        weekEnd.toISOString(),
        `ocupacao_${env.nomeSala}.pdf`,
      );
      setIsModalOpen(false);
      toast.success("Relatório gerado com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar relatório");
    }
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
