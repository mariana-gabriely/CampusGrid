import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Plus, FileDown, Loader2 } from "lucide-react";
import { cn } from "./ui/utils";
import { ScrollArea } from "./ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { environmentApi } from "../lib/api";
import { Ambiente } from "../types";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [environments, setEnvironments] = useState<Ambiente[]>([]);
  const [selectedEnvId, setSelectedEnvId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Mock de reservas para o exemplo (no futuro virá da API)
  const mockRequests: any[] = []; 

  useEffect(() => {
    loadEnvironments();
  }, []);

  async function loadEnvironments() {
    try {
      const data = await environmentApi.listarTodos();
      setEnvironments(data);
      if (data.length > 0) setSelectedEnvId(data[0].idAmbiente);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeSlots = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "aprovado": return "bg-orange-500 text-white border-orange-600";
      case "pendente": return "bg-amber-100 text-amber-800 border-amber-200";
      case "bloqueado": return "bg-slate-100 text-slate-400 border-slate-200";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
  };

  const getRequestsForSlot = (day: Date, hour: string) => {
    return mockRequests.filter(r => {
      if (r.environmentId !== selectedEnvId) return false;
      const requestDay = new Date(r.startDate);
      if (!isSameDay(requestDay, day)) return false;
      const requestStartHour = requestDay.getHours();
      const slotHour = parseInt(hour.split(":")[0]);
      return requestStartHour === slotHour;
    });
  };

  const handleGeneratePDF = () => {
    toast.success("mapa de ocupação gerado", {
      description: "o download do arquivo PDF iniciará em instantes"
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mapa de Ocupação</h1>
            <p className="text-sm text-slate-500">Monitoramento de ambientes em tempo real</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-slate-200 rounded-md overflow-hidden bg-white">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))} className="rounded-none border-r border-slate-100 h-9 w-9">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="rounded-none border-r border-slate-100 px-4 text-xs font-bold uppercase">
                    Hoje
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))} className="rounded-none h-9 w-9">
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {user?.perfil === "SOLICITANTE" ? (
              <Button onClick={() => navigate("/new-request")} className="rounded-md h-9 px-4 font-bold text-xs uppercase">
                  <Plus className="w-3.5 h-3.5 mr-2" /> Nova Reserva
              </Button>
            ) : (
              <Button onClick={handleGeneratePDF} variant="outline" className="rounded-md h-9 px-4 font-bold text-xs uppercase border-slate-200 text-slate-600 hover:bg-slate-50">
                  <FileDown className="w-3.5 h-3.5 mr-2" /> Gerar PDF
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Card className="rounded-md border-slate-200 shadow-none">
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-xs font-bold uppercase text-slate-400">Ambientes</CardTitle>
              </CardHeader>
              <CardContent className="p-1">
                <ScrollArea className="h-[500px]">
                    <div className="space-y-0.5">
                        {loading ? (
                            <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                        ) : environments.map(env => (
                        <button
                            key={env.idAmbiente}
                            onClick={() => setSelectedEnvId(env.idAmbiente)}
                            className={cn(
                                "w-full flex items-center justify-between p-3 transition-colors text-left",
                                selectedEnvId === env.idAmbiente 
                                ? "bg-orange-50 text-orange-700 border-l-4 border-l-primary font-bold" 
                                : "hover:bg-slate-50 text-slate-600 border-l-4 border-l-transparent"
                            )}
                        >
                            <div>
                                <p className="text-sm">{env.nomeSala}</p>
                                <p className="text-[10px] opacity-70">capacidade: {env.capacidade}</p>
                            </div>
                            {env.exclusivoCurso && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </button>
                        ))}
                    </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9 bg-white rounded-md border border-slate-200 overflow-hidden flex flex-col">
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
                <div className="p-3 border-r border-slate-200 text-[10px] font-bold text-slate-400 flex items-center justify-center uppercase">Hora</div>
                {weekDays.map(day => (
                    <div key={day.toISOString()} className={cn(
                        "p-3 text-center border-r border-slate-200 last:border-r-0",
                        isSameDay(day, new Date()) && "bg-orange-50/50"
                    )}>
                        <p className="text-[10px] font-bold uppercase text-slate-400">{format(day, "EEE", { locale: ptBR })}</p>
                        <p className="text-lg font-bold text-slate-900 leading-none mt-1">{format(day, "dd")}</p>
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px]">
                <div className="grid grid-cols-8 relative">
                    <div className="flex flex-col bg-slate-50/30">
                        {timeSlots.map(time => (
                            <div key={time} className="h-16 p-2 text-right border-b border-slate-100 border-r border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400">{time}</span>
                            </div>
                        ))}
                    </div>

                    {weekDays.map(day => (
                        <div key={day.toISOString()} className={cn(
                            "flex flex-col border-r border-slate-100 last:border-r-0",
                            isSameDay(day, new Date()) && "bg-orange-50/10"
                        )}>
                            {timeSlots.map(time => {
                                const requests = getRequestsForSlot(day, time);
                                return (
                                    <div key={time} className="h-16 border-b border-slate-50 p-0.5 relative">
                                        {requests.map(req => (
                                            <div
                                                key={req.id}
                                                className={cn(
                                                    "absolute inset-x-0.5 top-0.5 bottom-0.5 rounded border p-1.5 text-[9px] font-bold shadow-sm z-10 overflow-hidden",
                                                    getStatusStyle(req.status)
                                                )}
                                            >
                                                <p className="truncate uppercase">{req.requesterName}</p>
                                                <div className="flex items-center gap-1 opacity-80 mt-1">
                                                    <Clock className="w-2 h-2" />
                                                    <span>{format(new Date(req.startDate), "HH:mm")}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
