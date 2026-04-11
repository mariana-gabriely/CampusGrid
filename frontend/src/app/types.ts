export type UserRole = "solicitante" | "aprovador";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type RequestStatus = "pendente" | "aprovado" | "recusado";
export type EnvironmentStatus = "livre" | "pendente" | "ocupado" | "bloqueado";

export interface Environment {
  id: string;
  name: string;
  type: "teorica" | "multimidia" | "laboratorio";
  capacity: number;
  hasProjector: boolean;
  hasTV: boolean;
  hasMicrophone: boolean;
  hasAC: boolean;
  hasControlledAccess: boolean;
  exclusiveCourse?: string;
}

export interface Request {
  id: string;
  environmentId: string;
  environmentName: string;
  requesterId: string;
  requesterName: string;
  startDate: Date;
  endDate: Date;
  status: RequestStatus;
  needsProjector: boolean;
  needsTV: boolean;
  needsMicrophone: boolean;
  needsControlledAccess: boolean;
  attachments: string[];
  approverId?: string;
  approverName?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  requestId: string;
  timestamp: Date;
  details: string;
}
