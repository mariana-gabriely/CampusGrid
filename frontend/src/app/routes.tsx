import { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Root } from "./components/Root";
import { LoginPage } from "./components/LoginPage";
import { DashboardPage } from "./components/DashboardPage";
import { NewRequestPage } from "./components/NewRequestPage";
import { MyRequestsPage } from "./components/MyRequestsPage";
import { ApprovalPanelPage } from "./components/ApprovalPanelPage";
import { AuditLogPage } from "./components/AuditLogPage";
import { EnvironmentsPage } from "./components/EnvironmentsPage";
import { ReportsPage } from "./components/ReportsPage";
import { UsersPage } from "./components/UsersPage"; // Import new page
import { PermutasPage } from "./components/PermutasPage";
import { InstitutionalBlocksPage } from "./components/InstitutionalBlocksPage";
import { useAuth } from "./context/AuthContext";
import { UserRole } from "./types";

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.perfil)) return <Navigate to="/dashboard" replace />;
  return children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LoginPage },
      { path: "dashboard", element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
      { path: "new-request", element: <ProtectedRoute roles={["SOLICITANTE"]}><NewRequestPage /></ProtectedRoute> },
      { path: "my-requests", element: <ProtectedRoute roles={["SOLICITANTE"]}><MyRequestsPage /></ProtectedRoute> },
      { path: "permutas", element: <ProtectedRoute><PermutasPage /></ProtectedRoute> },
      { path: "approval-panel", element: <ProtectedRoute roles={["APROVADOR"]}><ApprovalPanelPage /></ProtectedRoute> },
      { path: "audit-log", element: <ProtectedRoute roles={["APROVADOR"]}><AuditLogPage /></ProtectedRoute> },
      { path: "users", element: <ProtectedRoute roles={["APROVADOR"]}><UsersPage /></ProtectedRoute> },
      { path: "environments", element: <ProtectedRoute roles={["APROVADOR"]}><EnvironmentsPage /></ProtectedRoute> },
      { path: "reports", element: <ProtectedRoute roles={["APROVADOR"]}><ReportsPage /></ProtectedRoute> },
      { path: "institutional-blocks", element: <ProtectedRoute roles={["APROVADOR"]}><InstitutionalBlocksPage /></ProtectedRoute> },
    ],
  },
]);
