import { Layout } from "./Layout";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { mockEnvironments } from "../data/mockData";
import { Building2, Users, Tv, Mic, AirVent, Lock, Plus, Edit2 } from "lucide-react";
import { Button } from "./ui/button";

export function EnvironmentsPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestão de Ambientes</h1>
            <p className="text-sm text-slate-500">Configurações técnicas e catálogo de espaços físicos UniFil.</p>
          </div>
          <Button className="rounded-md h-10 px-6 font-bold text-xs uppercase">
              <Plus className="w-4 h-4 mr-2" /> Novo Cadastro
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEnvironments.map((env) => (
                <Card key={env.id} className="rounded-md border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                        <Badge variant="outline" className="font-bold uppercase text-[10px] bg-white text-slate-500 border-slate-200">
                            {env.type}
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-primary">
                            <Edit2 className="w-4 h-4" />
                        </Button>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                        <h2 className="text-lg font-bold text-slate-900 mb-1">{env.name}</h2>
                        
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4 uppercase">
                            <Users className="w-3.5 h-3.5" />
                            <span>Lotação: {env.capacity}</span>
                        </div>

                        {env.exclusiveCourse && (
                            <div className="mb-6 p-2 bg-amber-50 border border-amber-100 rounded text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                                Exclusivo: {env.exclusiveCourse}
                            </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-slate-50 space-y-3">
                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Infraestrutura</p>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    { show: env.hasProjector, icon: Building2, label: 'Proj.' },
                                    { show: env.hasTV, icon: Tv, label: 'TV' },
                                    { show: env.hasMicrophone, icon: Mic, label: 'Áudio' },
                                    { show: env.hasAC, icon: AirVent, label: 'A/C' },
                                    { show: env.hasControlledAccess, icon: Lock, label: 'Chave' },
                                ].map((item, i) => item.show && (
                                    <div key={i} className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-600 uppercase">
                                        <item.icon className="w-2.5 h-2.5 text-primary" /> {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </Layout>
  );
}