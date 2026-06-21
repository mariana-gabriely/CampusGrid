import { useState } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { mockEnvironments } from "../data/mockData";
import { FileText, Upload, Calendar, Clock, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "./ui/utils";

export function NewRequestPage() {
  const [environmentId, setEnvironmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [needsProjector, setNeedsProjector] = useState(false);
  const [needsTV, setNeedsTV] = useState(false);
  const [needsMicrophone, setNeedsMicrophone] = useState(false);
  const [needsControlledAccess, setNeedsControlledAccess] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  const selectedEnvironment = mockEnvironments.find(e => e.id === environmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Solicitação enviada para análise.");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Solicitação</h1>
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
                  <Select value={environmentId} onValueChange={setEnvironmentId}>
                    <SelectTrigger className="h-11 rounded-md border-slate-200 bg-white">
                      <SelectValue placeholder="Selecione o local..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-md">
                      {mockEnvironments.map((env) => (
                        <SelectItem key={env.id} value={env.id}>
                          {env.name} (Cap: {env.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    2. Cronograma (Início e Fim) <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase"><Calendar className="w-3 h-3" /> Data <span className="text-red-500">*</span></p>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10 rounded-md border-slate-200" required />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase"><Clock className="w-3 h-3" /> Hora <span className="text-red-500">*</span></p>
                        <div className="flex items-center gap-2">
                            <Input type="time" placeholder="De" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-10 rounded-md border-slate-200" required />
                            <span className="text-slate-300">/</span>
                            <Input type="time" placeholder="Até" value={endTime} onChange={e => setEndTime(e.target.value)} className="h-10 rounded-md border-slate-200" required />
                        </div>
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
              </CardContent>
            </Card>

            <Card className="rounded-md border-slate-200 shadow-sm">
                <CardContent className="p-6">
                    <Label className="text-xs font-bold uppercase text-slate-500 block mb-4">4. Anexos e Documentação</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-md p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-primary transition-colors" />
                        <p className="text-sm font-bold text-slate-500">Clique para enviar arquivos PDF</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">Plano de aula ou autorização NPI</p>
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" className="w-full h-12 rounded-md font-bold uppercase tracking-wider text-xs bg-primary hover:opacity-90">
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
                                <p className="text-lg font-bold text-slate-900 leading-tight">{selectedEnvironment.name}</p>
                                <p className="text-xs font-bold text-primary uppercase mt-1">{selectedEnvironment.type}</p>
                            </div>
                            <div className="space-y-2 border-t border-slate-200 pt-4 text-xs">
                                <div className="flex justify-between font-medium">
                                    <span className="text-slate-400 uppercase font-bold text-[9px]">Capacidade</span>
                                    <span className="text-slate-700">{selectedEnvironment.capacity} pers.</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span className="text-slate-400 uppercase font-bold text-[9px]">Ar Condicionado</span>
                                    <span className="text-slate-700">{selectedEnvironment.hasAC ? "SIM" : "NÃO"}</span>
                                </div>
                            </div>
                            {selectedEnvironment.exclusiveCourse && (
                                <div className="p-3 bg-white border border-amber-200 rounded text-[10px] text-amber-800 font-medium">
                                    ⚠️ Sala exclusiva para o curso de {selectedEnvironment.exclusiveCourse}.
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
