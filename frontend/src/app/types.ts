export type UserRole = "SOLICITANTE" | "APROVADOR";

export interface Usuario {
  idUsuario: string;
  nome: string;
  email: string;
  perfil: UserRole;
  ativo: boolean;
  curso?: string;
}

export type RequestStatus = "pendente" | "aprovado" | "recusado";
export type EnvironmentStatus = "livre" | "pendente" | "ocupado" | "bloqueado";

export interface Ambiente {
  idAmbiente: string;
  nomeSala: string;
  categoria: string;
  capacidade: number;
  exclusivoCurso?: string;
  observacoes?: string;
  recursos: string[]; // Agora é uma lista simples de strings
  status: boolean;
  ativo: boolean;
}

export interface Reserva {
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

export interface Environment {
  id: string;
  name: string;
  type: string;
  capacity: number;
  hasProjector?: boolean;
  hasTV?: boolean;
  hasMicrophone?: boolean;
  hasAC?: boolean;
  hasControlledAccess?: boolean;
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
