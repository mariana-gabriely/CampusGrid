import { createBrowserRouter } from "react-router-dom";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LoginPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "new-request", Component: NewRequestPage },
      { path: "my-requests", Component: MyRequestsPage },
      { path: "permutas", Component: PermutasPage },
      { path: "approval-panel", Component: ApprovalPanelPage },
      { path: "audit-log", Component: AuditLogPage },
      { path: "users", Component: UsersPage }, // Added route
      { path: "environments", Component: EnvironmentsPage },
      { path: "reports", Component: ReportsPage },
    ],
  },
]);
