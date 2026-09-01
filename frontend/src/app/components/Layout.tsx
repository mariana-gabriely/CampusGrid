import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { reservaApi, permutaApi } from "../lib/api";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  CheckSquare,
  History,
  Building2,
  FileBarChart,
  LogOut,
  Users,
  User as UserIcon,
  ChevronDown,
  Bell,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "./ui/utils";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

interface LayoutProps {
  children: ReactNode;
}

import logoUnifil from "../../public/logo - unifil.png";
import logoUnifilCollapsed from "../../public/unifil - logo (2).png";

function SidebarHeaderWithLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarHeader className="h-16 flex items-center justify-center px-4">
      <img
        src={isCollapsed ? logoUnifilCollapsed : logoUnifil}
        alt="UniFil Logo"
        className={isCollapsed ? "h-6 object-contain shrink-0" : "h-8 object-contain shrink-0"}
      />
    </SidebarHeader>
  );
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const list: any[] = [];
        if (user.perfil === "SOLICITANTE") {
          const minhas = await reservaApi.listarMinhas();
          minhas.forEach((r: any) => {
            if (r.status === "APROVADO") {
              list.push({ message: `Sua reserva para ${r.nomeAmbiente} no dia ${format(new Date(r.dataInicio), "dd/MM")} foi aprovada!` });
            } else if (r.status === "RECUSADO") {
              list.push({ message: `Sua reserva para ${r.nomeAmbiente} no dia ${format(new Date(r.dataInicio), "dd/MM")} foi recusada.` });
            }
          });

          const rec = await permutaApi.listarRecebidas();
          rec.forEach((p: any) => {
            if (p.status === "PENDENTE_ACEITE") {
              list.push({ message: `Proposta de permuta recebida de ${p.nomeSolicitante} para a sala ${p.ambienteDestinatarioNome}.` });
            }
          });
        } else {
          // Aprovador
          const pendentes = await reservaApi.listarPendentes();
          if (pendentes.length > 0) {
            list.push({ message: `Há ${pendentes.length} solicitações de reserva aguardando aprovação.` });
          }
          const permutas = await permutaApi.listarPendentesGestor();
          if (permutas.length > 0) {
            list.push({ message: `Há ${permutas.length} permutas aguardando homologação final.` });
          }
        }
        const saved = localStorage.getItem("campusgrid_cleared_notifications");
        const clearedList = saved ? JSON.parse(saved) : [];
        const filteredList = list.filter((n: any) => !clearedList.includes(n.message));
        setNotifications(filteredList);
      } catch (e) {
        console.error("Erro ao carregar notificações", e);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleClearNotifications = () => {
    const messages = notifications.map(n => n.message);
    const saved = localStorage.getItem("campusgrid_cleared_notifications");
    const currentCleared = saved ? JSON.parse(saved) : [];
    const newCleared = Array.from(new Set([...currentCleared, ...messages]));
    localStorage.setItem("campusgrid_cleared_notifications", JSON.stringify(newCleared));
    setNotifications([]);
  };

  if (!user) {
    navigate("/");
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["SOLICITANTE", "APROVADOR"] },
    { icon: FileText, label: "Nova Solicitação", path: "/new-request", roles: ["SOLICITANTE"] },
    { icon: ClipboardList, label: "Minhas Reservas", path: "/my-requests", roles: ["SOLICITANTE"] },
    { icon: CheckSquare, label: "Painel de Aprovação", path: "/approval-panel", roles: ["APROVADOR"] },
    { icon: History, label: "Auditoria", path: "/audit-log", roles: ["APROVADOR"] },
    { icon: Users, label: "Usuários", path: "/users", roles: ["APROVADOR"] },
    { icon: Building2, label: "Ambientes", path: "/environments", roles: ["APROVADOR"] },
    { icon: FileBarChart, label: "Relatórios", path: "/reports", roles: ["APROVADOR"] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.perfil)
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-white w-full">
        <Sidebar collapsible="icon" className="z-30 border-r border-slate-200 shadow-none">
          <SidebarHeaderWithLogo />
          
          <SidebarContent>

            <SidebarMenu className="px-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(item.path)}
                      tooltip={item.label}
                      className={cn(
                        "h-10 rounded px-4 transition-colors mb-1 shadow-none",
                        isActive 
                            ? "bg-primary text-white hover:bg-primary" 
                            : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm group-data-[state=collapsed]:hidden">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-slate-100 text-[10px] font-medium text-slate-400 text-center group-data-[state=collapsed]:hidden">
             UniFil - Sistema de Reservas
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
            <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="text-slate-400 hover:text-slate-600" />
                    <div className="h-4 w-px bg-slate-200 hidden md:block" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block">CampusGrid</span>
                </div>

                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="text-slate-400 hover:text-slate-600 relative outline-none p-1 rounded-full hover:bg-slate-50 transition-colors">
                                <Bell className="w-5 h-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 rounded-xl border-slate-200 shadow-xl p-0 overflow-hidden mt-2">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Notificações ({notifications.length})</p>
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={handleClearNotifications} 
                                        className="text-[10px] font-bold text-primary hover:underline uppercase"
                                    >
                                        Limpar
                                    </button>
                                )}
                            </div>
                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                                {notifications.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic p-6 text-center">Nenhuma nova notificação.</p>
                                ) : (
                                    notifications.map((n, idx) => (
                                        <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex gap-2.5 items-start">
                                            <span className="text-xs text-slate-600 leading-relaxed font-medium">{n.message}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 p-1 pl-2 pr-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors outline-none">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-900 leading-none">{user.nome}</p>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase">{user.perfil}</p>
                                </div>
                                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded border-slate-200 shadow-lg">
                            <DropdownMenuLabel className="px-4 py-3">
                                <p className="text-sm font-bold text-slate-900">{user.nome}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="px-4 py-2 cursor-pointer">
                                <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
                                <span className="text-sm">Meu Perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={handleLogout}
                                className="px-4 py-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                <span className="text-sm font-bold">Sair</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="flex-1 p-8 bg-slate-50/30">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
