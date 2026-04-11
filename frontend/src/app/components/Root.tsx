import { Outlet } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";

export function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
