import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  CheckSquare,
  History,
  Building2,
  FileBarChart,
  LogOut,
  GraduationCap,
  Users,
  User as UserIcon,
  ChevronDown,
  Bell,
  Map,
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

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedCampus, setSelectedCampus] = useState("Campus Central");

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
    <SidebarProvider defaultOpen={true} collapsible="icon">
      <div className="flex min-h-screen bg-white w-full">
        <Sidebar className="z-30 border-r border-slate-200 shadow-none">
          <SidebarHeader className="h-16 flex items-center px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 group-data-[state=collapsed]:hidden">CampusGrid</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <div className="px-4 py-4 group-data-[state=collapsed]:hidden">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Campus Ativo</p>
                    <div className="flex items-center gap-2">
                        <Map className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-slate-700">{selectedCampus}</span>
                    </div>
                </div>
            </div>

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
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block">UniFil Acadêmico</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-slate-400 hover:text-slate-600">
                        <Bell className="w-5 h-5" />
                    </button>

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
