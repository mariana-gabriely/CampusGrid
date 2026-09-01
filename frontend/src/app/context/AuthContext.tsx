import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Usuario } from "../types";
import { apiFetch } from "../lib/api";

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("campusgrid_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha: password }),
    });

    if (data.token) {
      localStorage.setItem("campusgrid_token", data.token);
      
      const realUser: Usuario = {
        idUsuario: data.idUsuario,
        nome: data.nome,
        email: data.email,
        perfil: data.perfil,
        ativo: true,
        curso: data.curso
      };

      setUser(realUser);
      localStorage.setItem("campusgrid_user", JSON.stringify(realUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("campusgrid_token");
    localStorage.removeItem("campusgrid_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
