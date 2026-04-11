import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "../types";
import { apiFetch } from "../lib/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      localStorage.setItem("campusgrid_token", data.token);
      
      const realUser: User = {
        id: "id-from-token", // No futuro podemos pegar do JWT se necessário
        name: data.name,
        email: data.email,
        role: data.role.toLowerCase() // Normaliza para bater com o menu lateral
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
