import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertCircle, Eye, EyeOff, X, Loader2, KeyRound } from "lucide-react";
import logoUnifil from "../../public/logo - unifil.png";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Recovery modal states
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recovering, setRecovering] = useState(false);

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

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoveryMessage("");
    setRecovering(true);

    try {
      const response = await fetch("http://localhost:8080/auth/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      
      if (!response.ok) {
        throw new Error(await response.text() || "Erro ao solicitar recuperação");
      }
      
      const data = await response.json();
      setRecoveryMessage(`Sucesso! Sua nova senha temporária é: ${data.tempPassword}. Copie e use-a para fazer login.`);
    } catch (err: any) {
      setRecoveryError(err.message || "E-mail não encontrado ou erro no servidor.");
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Brand Column */}
      <div className="hidden md:flex md:w-5/12 bg-slate-50 items-center justify-center p-16 border-r border-slate-200">
        <div className="max-w-xs space-y-6">
          <img src={logoUnifil} alt="UniFil Logo" className="h-16 object-contain" />
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mt-2">CampusGrid</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Reserve salas e laboratórios através do CampusGrid
          </p>
        </div>
      </div>

      {/* Login Column */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center mb-8">
            <img src={logoUnifil} alt="UniFil Logo" className="h-16 object-contain" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Entrar no sistema</h2>
            <p className="text-sm text-slate-500 font-medium">Use seu e-mail institucional @unifil.br ou @edu.unifil.br</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@unifil.br ou nome@edu.unifil.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-md border-slate-200 focus:border-primary transition-all shadow-none"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</Label>
                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(true);
                    setRecoveryEmail("");
                    setRecoveryMessage("");
                    setRecoveryError("");
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Esqueci a senha
                </button>
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

            <Button type="submit" className="w-full h-12 text-sm font-bold rounded-md bg-primary hover:bg-primary/95 text-white shadow-none uppercase tracking-wide">
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

      {/* Recovery Modal */}
      {showRecovery && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Recuperação de Senha</h3>
              </div>
              <button onClick={() => setShowRecovery(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecovery} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Informe o seu e-mail cadastrado no sistema. Nós resetaremos a sua senha e forneceremos uma credencial temporária.
              </p>

              <div className="space-y-2">
                <Label htmlFor="rec-email" className="text-xs font-bold uppercase text-slate-400 tracking-wider">E-mail Cadastrado</Label>
                <Input
                  id="rec-email"
                  type="email"
                  placeholder="nome@unifil.br ou nome@edu.unifil.br"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="h-11 rounded-md border-slate-200 focus:border-primary shadow-none"
                  required
                />
              </div>

              {recoveryError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded text-xs font-medium border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {recoveryMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded text-xs font-bold border border-emerald-100 leading-relaxed">
                  {recoveryMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-md text-xs font-bold uppercase" onClick={() => setShowRecovery(false)}>
                  Voltar
                </Button>
                <Button type="submit" className="flex-1 h-11 rounded-md text-xs font-bold uppercase bg-primary hover:bg-primary/90 text-white" disabled={recovering}>
                  {recovering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Recuperar Senha
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
