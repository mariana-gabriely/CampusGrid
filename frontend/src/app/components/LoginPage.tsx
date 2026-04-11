import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { GraduationCap, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Brand Column */}
      <div className="hidden md:flex md:w-5/12 bg-slate-50 items-center justify-center p-16 border-r border-slate-100">
        <div className="max-w-sm space-y-12">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="font-bold text-xl text-slate-900">CampusGrid</span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">UniFil</span>
                </div>
            </div>
            
            <div className="space-y-6">
                <h2 className="text-4xl font-bold text-slate-900 leading-tight">Gestão inteligente de espaços físicos.</h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                    Reserve salas e laboratórios através do portal oficial de recursos da UniFil.
                </p>
            </div>

            <div className="pt-12 grid grid-cols-2 gap-4 border-t border-slate-200">
                <div>
                    <p className="text-2xl font-bold text-slate-900">100%</p>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Digital</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900">Zero</p>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Conflitos</p>
                </div>
            </div>
        </div>
      </div>

      {/* Login Column */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-10">
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">CampusGrid</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Entrar no sistema</h1>
            <p className="text-sm text-slate-500 font-medium">Use seu e-mail institucional @unifil.br</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome.sobrenome@unifil.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-md border-slate-200 focus:border-primary transition-all shadow-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</Label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Esqueci a senha</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-md border-slate-200 focus:border-primary transition-all pr-10 shadow-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded text-sm font-medium border border-red-100">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-sm font-bold rounded-md shadow-none hover:opacity-90">
              Acessar Portal
            </Button>
          </form>
          
          <div className="text-center pt-8 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium">
                Desenvolvido pelo Núcleo de Práticas em Informática - UniFil
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
